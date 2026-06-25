const getMetaContent = (name) =>
    document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") || "";

const stateUrl = getMetaContent("builder-state-url");
const saveUrl = getMetaContent("builder-save-url");
const publishUrl = getMetaContent("builder-publish-url");
const csrfToken = getMetaContent("csrf-token");

function notify(message, type = "info") {
    const app = window.DesignITApp;
    const notification = app?.getManager?.("notification");

    if (notification) {
        const method = type === "success" ? "showSuccess" : type === "error" ? "showError" : "showInfo";
        notification[method](message);
        return;
    }

    const statusRegion = document.getElementById("status-region");
    if (statusRegion) {
        statusRegion.textContent = message;
    }
}

function setBusy(isBusy) {
    ["save-to-cms", "publish-to-cms"].forEach((id) => {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = isBusy;
        }
    });
}

function waitForStudio() {
    if (window.DesignITApp?.isInitialized) {
        return Promise.resolve(window.DesignITApp);
    }

    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject(new Error("Builder did not finish initializing."));
        }, 10000);

        window.addEventListener(
            "designit:ready",
            (event) => {
                window.clearTimeout(timeout);
                resolve(event.detail.app);
            },
            { once: true }
        );
    });
}

async function loadBuilderState(app) {
    const response = await fetch(stateUrl, { credentials: "same-origin" });
    if (!response.ok) {
        throw new Error("Failed to load builder state.");
    }

    const data = await response.json();
    const canvasManager = app.getManager("canvas");
    canvasManager.loadBuilderState(data.builder_json);

    if (data.source === "legacy") {
        notify("Legacy content loaded into the builder.", "info");
    }
}

function collectPayload(app) {
    const canvasManager = app.getManager("canvas");
    if (!canvasManager?.getBuilderPayload) {
        throw new Error("Builder state API is not available.");
    }

    return canvasManager.getBuilderPayload();
}

async function postJson(url, payload = {}) {
    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed.");
    }

    return response.json();
}

async function saveBuilderState(app) {
    const payload = collectPayload(app);
    await postJson(saveUrl, payload);
    notify("Draft saved.", "success");
}

async function publishBuilderState(app) {
    const payload = collectPayload(app);
    await postJson(publishUrl, payload);
    notify("Builder content published.", "success");
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const app = await waitForStudio();
        await loadBuilderState(app);

        document.getElementById("save-to-cms")?.addEventListener("click", async () => {
            try {
                setBusy(true);
                await saveBuilderState(app);
            } catch (error) {
                console.error(error);
                notify(error.message || "Unable to save builder content.", "error");
            } finally {
                setBusy(false);
            }
        });

        document.getElementById("publish-to-cms")?.addEventListener("click", async () => {
            try {
                setBusy(true);
                await publishBuilderState(app);
            } catch (error) {
                console.error(error);
                notify(error.message || "Unable to publish builder content.", "error");
            } finally {
                setBusy(false);
            }
        });
    } catch (error) {
        console.error(error);
        notify(error.message || "Unable to initialize CMS builder integration.", "error");
    }
});

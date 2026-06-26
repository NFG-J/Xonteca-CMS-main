#!/usr/bin/env python3
"""
Excel to JSON Converter for DesignIT Studio
============================================

This script converts an Excel file containing web components data
to a JSON format suitable for the DesignIT Studio application.

Author: Niels F. Garmann-Johnsen
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
"""

import pandas as pd
import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExcelToJsonConverter:
    """Converts Excel files to JSON format for DesignIT Studio."""
    
    # Default configuration
    DEFAULT_CONFIG = {
        'excel_file': 'data/WebComponents (version 2025-02-04).xlsx',
        'sheet_name': 'Components',
        'output_file': 'data/html_components.json',
        'required_columns': ['Title', 'HTML', 'CSS', 'Reference'],
        'encoding': 'utf-8'
    }
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the converter with configuration.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = {**self.DEFAULT_CONFIG, **(config or {})}
        self.validate_config()
    
    def validate_config(self) -> None:
        """Validate the configuration."""
        required_keys = ['excel_file', 'sheet_name', 'output_file', 'required_columns']
        
        for key in required_keys:
            if key not in self.config:
                raise ValueError(f"Missing required configuration key: {key}")
        
        if not isinstance(self.config['required_columns'], list):
            raise ValueError("required_columns must be a list")
    
    def validate_file_paths(self) -> None:
        """Validate input and output file paths."""
        excel_path = Path(self.config['excel_file'])
        
        if not excel_path.exists():
            raise FileNotFoundError(f"Excel file not found: {excel_path}")
        
        if not excel_path.suffix.lower() in ['.xlsx', '.xls']:
            raise ValueError(f"Invalid Excel file format: {excel_path.suffix}")
        
        # Ensure output directory exists
        output_path = Path(self.config['output_file'])
        output_path.parent.mkdir(parents=True, exist_ok=True)
    
    def load_excel_data(self) -> pd.DataFrame:
        """
        Load data from Excel file.
        
        Returns:
            DataFrame containing the Excel data
            
        Raises:
            Exception: If Excel file cannot be read
        """
        try:
            logger.info(f"Loading Excel file: {self.config['excel_file']}")
            
            df = pd.read_excel(
                self.config['excel_file'], 
                sheet_name=self.config['sheet_name']
            )
            
            logger.info(f"Loaded {len(df)} rows from sheet '{self.config['sheet_name']}'")
            return df
            
        except Exception as e:
            logger.error(f"Failed to load Excel file: {e}")
            raise
    
    def validate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and clean the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Cleaned and validated DataFrame
        """
        logger.info("Validating data...")
        
        # Check if required columns exist
        missing_columns = [
            col for col in self.config['required_columns'] 
            if col not in df.columns
        ]
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Log available columns
        logger.info(f"Available columns: {list(df.columns)}")
        
        # Select only required columns
        df_clean = df[self.config['required_columns']].copy()
        
        # Remove rows with missing critical data
        initial_rows = len(df_clean)
        df_clean = df_clean.dropna(subset=['Title', 'HTML'])
        removed_rows = initial_rows - len(df_clean)
        
        if removed_rows > 0:
            logger.warning(f"Removed {removed_rows} rows with missing Title or HTML")
        
        # Fill missing CSS and Reference with empty strings
        df_clean['CSS'] = df_clean['CSS'].fillna('')
        df_clean['Reference'] = df_clean['Reference'].fillna('')
        
        # Clean up text data
        for col in df_clean.columns:
            if df_clean[col].dtype == 'object':
                df_clean[col] = df_clean[col].astype(str).str.strip()
        
        logger.info(f"Validated data: {len(df_clean)} valid rows")
        return df_clean
    
    def convert_to_dict(self, df: pd.DataFrame) -> List[Dict]:
        """
        Convert DataFrame to list of dictionaries.
        
        Args:
            df: Input DataFrame
            
        Returns:
            List of component dictionaries
        """
        logger.info("Converting to dictionary format...")
        
        data = []
        for _, row in df.iterrows():
            component = {
                'Title': row['Title'],
                'HTML': row['HTML'],
                'CSS': row['CSS'],
                'Reference': row['Reference']
            }
            
            # Additional validation for each component
            if not component['Title'] or not component['HTML']:
                logger.warning(f"Skipping component with missing Title or HTML: {component['Title']}")
                continue
            
            data.append(component)
        
        logger.info(f"Converted {len(data)} components")
        return data
    
    def save_json(self, data: List[Dict]) -> None:
        """
        Save data to JSON file.
        
        Args:
            data: List of component dictionaries
        """
        try:
            logger.info(f"Saving to JSON file: {self.config['output_file']}")
            
            with open(
                self.config['output_file'], 
                'w', 
                encoding=self.config['encoding']
            ) as json_file:
                json.dump(
                    data, 
                    json_file, 
                    indent=4, 
                    ensure_ascii=False
                )
            
            # Verify file was created
            output_path = Path(self.config['output_file'])
            if output_path.exists():
                file_size = output_path.stat().st_size
                logger.info(f"Successfully saved {len(data)} components ({file_size} bytes)")
            else:
                raise Exception("Output file was not created")
                
        except Exception as e:
            logger.error(f"Failed to save JSON file: {e}")
            raise
    
    def convert(self) -> bool:
        """
        Perform the complete conversion process.
        
        Returns:
            True if conversion was successful, False otherwise
        """
        try:
            logger.info("Starting Excel to JSON conversion...")
            
            # Validate file paths
            self.validate_file_paths()
            
            # Load and process data
            df = self.load_excel_data()
            df_clean = self.validate_data(df)
            data = self.convert_to_dict(df_clean)
            
            if not data:
                logger.error("No valid data to export")
                return False
            
            # Save JSON
            self.save_json(data)
            
            logger.info("Conversion completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Conversion failed: {e}")
            return False
    
    def get_statistics(self) -> Dict:
        """Get conversion statistics."""
        try:
            output_path = Path(self.config['output_file'])
            if output_path.exists():
                with open(output_path, 'r', encoding=self.config['encoding']) as f:
                    data = json.load(f)
                
                return {
                    'total_components': len(data),
                    'file_size_bytes': output_path.stat().st_size,
                    'output_file': str(output_path),
                    'last_modified': output_path.stat().st_mtime
                }
            
        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
        
        return {}


def main():
    """Main function to run the converter."""
    try:
        # Get the script directory
        script_dir = Path(__file__).parent
        
        # Configuration for this specific project
        config = {
            'excel_file': script_dir / 'data' / 'WebComponents (version 2025-02-04).xlsx',
            'sheet_name': 'Components',
            'output_file': script_dir / 'data' / 'html_components.json',
            'required_columns': ['Title', 'HTML', 'CSS', 'Reference']
        }
        
        # Create converter and run
        converter = ExcelToJsonConverter(config)
        success = converter.convert()
        
        if success:
            stats = converter.get_statistics()
            if stats:
                print(f"\nConversion Statistics:")
                print(f"- Total components: {stats.get('total_components', 'N/A')}")
                print(f"- Output file size: {stats.get('file_size_bytes', 0)} bytes")
                print(f"- Output file: {stats.get('output_file', 'N/A')}")
            
            sys.exit(0)
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Conversion cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

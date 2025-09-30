#!/usr/bin/env python3
"""
Upload photos to Wikimedia Commons using pywikibot.

This script handles uploading photos from the local portfolio to Wikimedia Commons
with proper metadata, licensing, and categorization.
"""

import pywikibot
from pywikibot.specialbots import UploadRobot
import sys
import os
import json
from pathlib import Path


def parse_filename(filename):
    """
    Parse filename to extract subject, event, and year.
    Format: subject_event_year.jpg
    Example: vanessa-kirby_toronto-film-festival_2024.jpg
    """
    name = Path(filename).stem
    parts = name.split('_')

    subject = parts[0].replace('-', ' ').title() if len(parts) > 0 else ''
    event = parts[1].replace('-', ' ').title() if len(parts) > 1 else ''
    year = parts[2] if len(parts) > 2 else ''

    return subject, event, year


def generate_description(filename, subject, event, year, photographer="Jay Dixit",
                        license_template="{{self|cc-by-sa-4.0}}",
                        categories=None, additional_info=""):
    """
    Generate a Commons-compatible description page in wiki markup.
    """
    if categories is None:
        categories = []

    # Build the description
    description = f"""== {{{{int:filedesc}}}} ==
{{{{Information
|Description={{{{en|1={subject}"""

    if event:
        description += f" at {event}"
    if year:
        description += f" in {year}"

    description += f"""}}}}}}
|Source={{{{Own}}}}
|Author=[[User:Jaydixit|{photographer}]]
|Date={year if year else ""}
|Permission=
|other_versions=
}}}}
{additional_info}

== {{{{int:license-header}}}} ==
{license_template}

"""

    # Add categories
    for category in categories:
        description += f"[[Category:{category}]]\n"

    return description


def upload_photo(file_path, target_filename=None, description_text="",
                ignore_warnings=False, chunk_size=1048576):
    """
    Upload a single photo to Wikimedia Commons.

    Args:
        file_path: Path to the local file
        target_filename: Filename on Commons (defaults to original filename)
        description_text: Wiki markup for the file description page
        ignore_warnings: Whether to ignore upload warnings
        chunk_size: Size of upload chunks in bytes (default 1MB)
    """
    site = pywikibot.Site('commons', 'commons')

    if not target_filename:
        target_filename = os.path.basename(file_path)

    # Create the upload robot
    bot = UploadRobot(
        url=[file_path],
        description=description_text,
        use_filename=target_filename,
        keep_filename=True,
        verify_description=True,
        ignore_warning=ignore_warnings,
        target_site=site,
        chunk_size=chunk_size
    )

    bot.run()
    print(f"✓ Uploaded: {target_filename}")


def main():
    """
    Main entry point for the upload script.
    """
    if len(sys.argv) < 2:
        print("Usage: python3 upload-to-commons.py <photo_path> [options]")
        print("\nOptions:")
        print("  --config <json_file>  : JSON file with upload metadata")
        print("  --categories <cat1,cat2> : Comma-separated categories")
        print("  --license <template>  : License template (default: cc-by-sa-4.0)")
        print("\nExample:")
        print("  python3 upload-to-commons.py photo.jpg --categories 'Film festivals,2024'")
        sys.exit(1)

    photo_path = sys.argv[1]

    if not os.path.exists(photo_path):
        print(f"Error: File not found: {photo_path}")
        sys.exit(1)

    # Parse options
    categories = []
    license_template = "{{self|cc-by-sa-4.0}}"
    config_file = None

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--categories' and i + 1 < len(sys.argv):
            categories = [cat.strip() for cat in sys.argv[i + 1].split(',')]
            i += 2
        elif sys.argv[i] == '--license' and i + 1 < len(sys.argv):
            license_template = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--config' and i + 1 < len(sys.argv):
            config_file = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    # Load config if provided
    if config_file and os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
            categories.extend(config.get('categories', []))
            license_template = config.get('license', license_template)

    # Parse filename
    filename = os.path.basename(photo_path)
    subject, event, year = parse_filename(filename)

    # Generate description
    description = generate_description(
        filename, subject, event, year,
        license_template=license_template,
        categories=categories
    )

    print(f"Uploading: {filename}")
    print(f"Subject: {subject}")
    print(f"Event: {event}")
    print(f"Year: {year}")
    print(f"Categories: {', '.join(categories)}")
    print("\nDescription page:")
    print("=" * 60)
    print(description)
    print("=" * 60)
    print("\nProceed with upload? (y/n): ", end='')

    response = input().strip().lower()
    if response != 'y':
        print("Upload cancelled.")
        sys.exit(0)

    # Upload the photo
    upload_photo(photo_path, filename, description)


if __name__ == '__main__':
    main()
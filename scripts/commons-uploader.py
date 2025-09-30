#!/usr/bin/env python3
"""
Simple wrapper around pywikibot's upload.py for Commons uploads.

Usage:
    python3 commons-uploader.py <photo_path> [description] [categories]
"""

import sys
import os
import subprocess
from pathlib import Path


def parse_filename(filename):
    """Parse filename to extract metadata."""
    name = Path(filename).stem
    parts = name.split('_')

    subject = parts[0].replace('-', ' ').title() if len(parts) > 0 else ''
    event = parts[1].replace('-', ' ').title() if len(parts) > 1 else ''
    year = parts[2] if len(parts) > 2 else ''

    return subject, event, year


def generate_description(subject, event, year, categories=None):
    """Generate Commons description."""
    if categories is None:
        categories = []

    desc = f"{{{{Information\n|Description={subject}"
    if event:
        desc += f" at {event}"
    if year:
        desc += f" in {year}"
    desc += "\n|Source={{Own}}\n|Author=[[User:Jaydixit|Jay Dixit]]\n"
    desc += f"|Date={year}\n}}}}\n\n"
    desc += "{{self|cc-by-sa-4.0}}\n\n"

    for cat in categories:
        desc += f"[[Category:{cat}]]\n"

    return desc


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 commons-uploader.py <photo_path> [categories]")
        print("\nExample:")
        print("  python3 commons-uploader.py photo.jpg 'Film festivals,Toronto'")
        sys.exit(1)

    photo_path = sys.argv[1]

    if not os.path.exists(photo_path):
        print(f"Error: File not found: {photo_path}")
        sys.exit(1)

    # Parse categories
    categories = []
    if len(sys.argv) > 2:
        categories = [c.strip() for c in sys.argv[2].split(',')]

    # Parse filename
    filename = os.path.basename(photo_path)
    subject, event, year = parse_filename(filename)

    # Generate description
    description = generate_description(subject, event, year, categories)

    print(f"\nFile: {filename}")
    print(f"Subject: {subject}")
    print(f"Event: {event}")
    print(f"Year: {year}")
    print(f"Categories: {', '.join(categories)}")
    print("\nDescription:")
    print("=" * 60)
    print(description)
    print("=" * 60)

    # Use pwb upload command
    cmd = [
        'pwb', 'upload',
        photo_path,
        '-description:' + description,
        '-filename:' + filename,
        '-noverify'
    ]

    print("\nRunning: " + ' '.join(cmd))
    subprocess.run(cmd)


if __name__ == '__main__':
    main()
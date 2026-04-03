#!/bin/sh

cd "$(dirname "$0")/.."

version=$(grep '"version":' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

echo "Building version $version..."

rm -f zotero-citation-counts-v${version}.xpi
zip -r zotero-citation-counts-v${version}.xpi locale/* icons/*.png manifest.json bootstrap.js preferences.xhtml prefs.js zoterocitationcounts.js

# To release a new version:
# - Increase the version number in manifest.json
# - Run this script to create a new .xpi file
# - Commit and push to GitHub
# - Make a release on GitHub, and manually upload the .xpi file
# - Update updates.json (version & SHA-256 hash), then push again

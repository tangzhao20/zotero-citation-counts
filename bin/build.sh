#!/bin/sh

cd "$(dirname "$0")/.."

version=$(grep '"version":' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

echo "Building version $version..."

xpi_file="zotero-citation-counts-v${version}.xpi"

rm -f "$xpi_file"
zip -r "$xpi_file" locale/* icons/*.png manifest.json bootstrap.js preferences.xhtml prefs.js zoterocitationcounts.js

if [ "$(uname)" = "Linux" ]; then
    sha256sum "$xpi_file"
fi

# To release a new version:
# - Increase the version number in manifest.json
# - Run this script to create a new .xpi file
# - Commit and push to GitHub
# - Make a release on GitHub, and manually upload the .xpi file
# - Update updates.json (version & SHA-256 hash), then push again

#!/bin/sh

# Create temp directory and copy project files to it
tmp_dir=$(mktemp -d -t XXXXXXXXXXXX)
cp -R . $tmp_dir

# Install node_modules (required for type checking to work)
yarn --cwd $tmp_dir

# Remove all non-TS components
find $tmp_dir/src -type f -print0 | xargs --null grep -Z -L "<script lang=\"ts\">" | xargs --null rm

# Perform type checking of remaining components
vtc --workspace . --srcDir $tmp_dir/src

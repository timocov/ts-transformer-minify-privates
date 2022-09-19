#!/bin/bash

set -e

echo ">> Cleaning up..."
rm -rf lib/ dist/
mkdir -p dist/

echo ">> Building a package..."
npm run tsc
cp -r lib/src/* dist/

echo ">> Cleaning up a package.json file..."
node scripts/clean-package-json.js

echo "Package is ready to publish"

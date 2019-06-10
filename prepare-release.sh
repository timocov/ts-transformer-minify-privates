#!/bin/bash

set -e

echo ">> Cleaning up..."
rm -rf lib/ dist/
mkdir -p dist/

echo ">> Building a package..."
npm run tsc
cp -r lib/src/* dist/

echo ">> Cleaning up a package.json file..."
./node_modules/.bin/clear-package-json package.json --fields private -o package.json

echo "Package is ready to publish"

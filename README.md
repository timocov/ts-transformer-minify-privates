# ts-transformer-minify-privates

[![npm version](https://badge.fury.io/js/ts-transformer-minify-privates.svg)](https://www.npmjs.com/package/ts-transformer-minify-privates)
[![CircleCI](https://img.shields.io/circleci/build/github/timocov/ts-transformer-minify-privates.svg)](https://circleci.com/gh/timocov/ts-transformer-minify-privates)
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-minify-privates.svg)](https://www.npmjs.com/package/ts-transformer-minify-privates)

A TypeScript custom transformer which minify names of private class members.

For now it just renames private members with prepending some prefix to name.
For example, if you have `privateMember`, then after transformation the name will be `_private_privateMember`.
After that you can use terser/uglify with mangle options to minify that members.
Note, that private class members with decorators won't be prefixed and further minified.

## Caution!!!

Before start using this transformer in the production, I strongly recommend you check that your code compiles successfully and all files has correct output.
I would say **check the whole project file-by-file** and compare the input with the (expected) output.

I cannot guarantee you that the transformer covers all possible cases, but it has tests for the most popular ones, and if you catch a bug - please feel free to create an issue.

I've tested it for several projects and it works well.

## Requirement

- Make sure that `noImplicitThis` is enabled in your tsconfig.

## Options

### prefix

*Default: `_private_`*

The prefix which will be added to private member's name.

## How to use the custom transformer

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (see https://github.com/Microsoft/TypeScript/issues/14419).
The followings are the example usage of the custom transformer.

### webpack (with ts-loader or awesome-typescript-loader)

```js
// webpack.config.js
const minifyPrivatesTransformer = require('ts-transformer-minify-privates').default;

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader', // or 'awesome-typescript-loader'
        options: {
          getCustomTransformers: program => ({
              before: [
                  minifyPrivatesTransformer(program)
              ]
          })
        }
      }
    ]
  }
};

```

### Rollup (with rollup-plugin-typescript2)

```js
// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import minifyPrivatesTransformer from 'ts-transformer-minify-privates';

export default {
  // ...
  plugins: [
    typescript({ transformers: [service => ({
      before: [ minifyPrivatesTransformer(service.getProgram()) ],
      after: []
    })] })
  ]
};
```

### ttypescript

See [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for how to use this with module bundlers such as webpack or Rollup.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-transformer-minify-privates" }
    ]
  },
  // ...
}
```

## Results

[I've tested](https://github.com/tradingview/lightweight-charts/commit/9454d575fd1496224a2487d02baaacaf2713b64c) the transformer on [lightweight-charts](https://github.com/tradingview/lightweight-charts) and the bundle size was reduced:

- on ~15% min (from 186KB to 157KB)
- on ~5% min.gz (from 43KB to 41KB)

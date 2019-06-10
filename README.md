# ts-transformer-minify-privates

**_(CURRENTLY WORK IN PROGRESS)_**

A TypeScript custom transformer which minify names of private class members.

## Requirement

TypeScript >= 2.9.1

## How to use the custom transformer

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (see https://github.com/Microsoft/TypeScript/issues/14419).
The followings are the example usage of the custom transformer.

### webpack (with ts-loader or awesome-typescript-loader)

```js
// webpack.config.js
const minifyPrivatesTransformer = require('ts-transformer-minify-privates/transformer').default;

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
import minifyPrivatesTransformer from 'ts-transformer-minify-privates/transformer';

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
      { "transform": "ts-transformer-minify-privates/transformer" }
    ]
  },
  // ...
}
```

## TODO

1. Tests
1. Handle or fail for accessing runtime-based properties, e.g. `this[Math.random() > .5 ? 'privateMethod' : 'privateMethod2']()`.
1. Implement stable name generation (e.g. calc hash from name, not just random name) to increase stability and avoid changing hashes of files.
1. Add option to choose strategy of the name generator (per file, per project, etc).

## Note

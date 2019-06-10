# ts-transformer-minify-privates

**_(CURRENTLY WORK IN PROGRESS)_**

A TypeScript custom transformer which minify names of private class members.

For now it just renames private members with prepending some prefix to name.
For example, if you have `privateMember`, then after transformation the name will be `_private_privateMember`.
After that you can use terser/uglify with mangle options to minify that members.

## Requirement

TypeScript >= 2.9.1

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

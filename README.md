# WXML

🌇WXML parser and serializer.

[![Build Status][travis-image]][travis-url]
[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Standard Version][standard-version-image]][standard-version-url]
[![Codecov][codecov-image]][codecov-url]

# Install

`yarn add @vivaxy/wxml` or `npm i @vivaxy/wxml --save`

# Usage

```js
import * as wxml from '@vivaxy/wxml';
const parsed = wxml.parse('<view></view>');
wxml.traverse(parsed, function visitor(node, parent) {
  const type = node.type;
  const parentNode = node.parentNode;

  if (type === wxml.NODE_TYPES.ELEMENT) {
    // handle element node
    const tagName = node.tagName;
    const attributes = node.attributes; // an object represents the attributes
    const childNodes = node.childNodes;
    const selfClosing = node.selfClosing; // if a node is self closing, like `<tag />`
  } else if (type === wxml.NODE_TYPES.TEXT) {
    // handle text node
    const textContent = node.textContent;
  } else if (type === wxml.NODE_TYPES.COMMENT) {
    // handle comment node
    const comment = node.comment;
  }
});
const serialized = wxml.serialize(parsed);
```

# API

## `parse`

`(input: string) => AST`

## `traverse`

`(node: Node, visitor: (node: Node, parent: Node) => void) => void`

## `serialize`

`(node: Node) => string`

[travis-image]: https://img.shields.io/travis/vivaxy/WXML.svg?style=flat-square
[travis-url]: https://travis-ci.org/vivaxy/WXML
[npm-version-image]: https://img.shields.io/npm/v/@vivaxy/wxml.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@vivaxy/wxml
[npm-downloads-image]: https://img.shields.io/npm/dt/@vivaxy/wxml.svg?style=flat-square
[license-image]: https://img.shields.io/npm/l/@vivaxy/wxml.svg?style=flat-square
[license-url]: LICENSE
[standard-version-image]: https://img.shields.io/badge/release-standard%20version-brightgreen.svg?style=flat-square
[standard-version-url]: https://github.com/conventional-changelog/standard-version
[codecov-image]: https://img.shields.io/codecov/c/github/vivaxy/WXML.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/vivaxy/WXML

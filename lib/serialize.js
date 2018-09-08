/**
 * @since 2018-09-08 12:58:35
 * @author vivaxy
 */

const nodeTypes = require('../types/node-types.js');

const serializeByType = {
  [nodeTypes.TEXT](node) {
    return node.text;
  },
  [nodeTypes.COMMENT](node) {
    return `<!--${node.comment}-->`;
  },
  [nodeTypes.ELEMENT](node) {
    const tagName = node.tagName || '';
    let attrsString = Object.keys(node.attrs || {})
      .map((name) => {
        if (node.attrs[name] === true) {
          return name;
        }
        return `${name}="${node.attrs[name]}"`;
      })
      .join(' ');
    if (attrsString) {
      attrsString = ' ' + attrsString;
    }

    if (node.selfClosing) {
      return `<${tagName}${attrsString} />`;
    }

    if (node.childNodes && node.childNodes.length) {
      const childNodesString = node.childNodes.map(serialize).join('');

      return `<${tagName || ''}${attrsString}>${childNodesString}</${tagName}>`;
    }

    return `<${tagName}${attrsString}></${tagName}>`;
  },
  [nodeTypes.CDATA_SECTION](node) {
    throw new Error('Implement');
  },
};

function serialize(node) {
  if (!serializeByType[node.type]) {
    throw new Error('Unexpected node.type: ' + node.type);
  }
  return serializeByType[node.type](node);
}

module.exports = serialize;

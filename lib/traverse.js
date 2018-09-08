/**
 * @since 2018-09-08 13:03:56
 * @author vivaxy
 */

const nodeTypes = require('../types/node-types.js');

const traverseByType = {
  [nodeTypes.TEXT](node, visitor, parent) {},
  [nodeTypes.ELEMENT](node, visitor, parent) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach((childNode) => {
        traverse(childNode, visitor, node);
      });
    }
  },
  [nodeTypes.COMMENT](node, visitor, parent) {},
  [nodeTypes.CDATA_SECTION](node, visitor, parent) {},
};

function traverse(node, visitor, parent = null) {
  visitor(node, parent);
  if (!traverseByType[node.type]) {
    throw new Error('Unexpected node.type: ' + node.type);
  }
  traverseByType[node.type](node, visitor, parent);
}

module.exports = traverse;

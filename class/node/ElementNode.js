/**
 * @since 20180808 11:08
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class ElementNode extends BaseNode {
  constructor({ type, tagName, childNodes = [] }) {
    const nodeTypes = require('../../enums/nodeTypes.js');
    super({ type: nodeTypes.ELEMENT });
    this.tagName = tagName;
    this.childNodes = childNodes;
  }

  traverse(visitor) {
    visitor(this);
    this.childNodes.forEach((node) => {
      if (node.traverse) {
        node.traverse(visitor);
      }
    });
  }

  dispose() {
    super.dispose();
    this.tagName = null;
    this.childNodes = null;
  }
};

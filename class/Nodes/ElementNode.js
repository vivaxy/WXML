/**
 * @since 20180808 11:08
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class ElementNode extends BaseNode {
  constructor(tagName, childNodes = []) {
    const nodeTypes = require('../../enums/nodeTypes.js');
    super(nodeTypes.ELEMENT);
    this.tagName = tagName;
    this.childNodes = childNodes;
    this.attrs = {};
    this.isSelfClosing = false;

    // cache info
    // this.composingState = ENCS.NOT_OPEN;
    this.composingAttrName = null;
  }

  clean() {
    delete this.composingState;
    delete this.composingAttrName;
  }

  dispose() {
    super.dispose();
    this.tagName = null;
    this.childNodes = null;
    this.attrs = null;
    this.isSelfClosing = null;
  }

  traverse(visitor) {
    visitor(this);
    this.childNodes.forEach((node) => {
      node.traverse(visitor);
    });
  }

  toString() {
    const attrsString = Object.keys(this.attrs).reduce((acc, name, value) => {
      return `${acc} ${name}="${value.replace(/"/g, '"')}"`;
    }, '');

    if (this.isSelfClosing) {
      return `<${this.tagName} ${attrsString} />`;
    }

    if (this.childNodes) {
      const childNodesString = this.childNodes
        .reduce((acc, node) => {
          return `  ${node.toString()}
`;
        }, '')
        .slice(0, -1);

      return `<${this.tagName} ${attrsString}>${childNodesString}</${
        this.tagName
      }>`;
    }

    return `<${this.tagName} ${attrsString}></${this.tagName}>`;
  }
};

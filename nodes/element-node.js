/**
 * @since 20180808 11:08
 * @author vivaxy
 */

const BaseNode = require('./base-node.js');
const nodeTypes = require('../enums/node-types.js');

module.exports = class ElementNode extends BaseNode {
  constructor() {
    super(nodeTypes.ELEMENT);
    this.tagName = '';
    this.attrs = {};
    this.childNodes = [];
    this.selfClosing = false;
  }

  dispose() {
    super.dispose();
    this.tagName = null;
    this.attrs = null;
    this.childNodes = null;
    this.selfClosing = null;
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

    if (this.selfClosing) {
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

  toJSON() {
    const ret = {
      type: this.type,
      tagName: this.tagName,
    };
    if (Object.keys(this.attrs).length) {
      ret.attrs = this.attrs;
    }
    if (this.childNodes.length) {
      ret.childNodes = this.childNodes.map((childNode) => {
        return childNode.toJSON();
      });
    }
    if (this.selfClosing) {
      ret.selfClosing = true;
    }
    return ret;
  }
};

/**
 * @since 20180808 11:08
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class ElementNode extends BaseNode {
  constructor() {
    const nodeTypes = require('../../enums/nodeTypes.js');
    super(nodeTypes.ELEMENT);
    this.tagName = null;
    this.childNodes = [];
    this.attrs = {};
    this.isSelfClosing = false;
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

  toJSON() {
    const ret = {
      type: this.type,
      tagName: this.tagName,
    };
    if (this.childNodes.length) {
      ret.childNodes = this.childNodes.map((childNode) => {
        return childNode.toJSON();
      });
    }
    if (Object.keys(this.attrs).length) {
      ret.attrs = this.attrs;
    }
    if (this.isSelfClosing) {
      ret.isSelfClosing = true;
    }
    return ret;
  }
};

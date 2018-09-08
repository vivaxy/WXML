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

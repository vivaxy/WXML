/**
 * @since 20180808 11:15
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');
const nodeTypes = require('../enums/nodeTypes.js');

module.exports = class TextNode extends BaseNode {
  constructor(text) {
    super(nodeTypes.TEXT);
    this.text = text;
  }

  dispose() {
    super.dispose();
    this.text = null;
  }

  toString() {
    return this.text;
  }

  toJSON() {
    return {
      type: this.type,
      text: this.text,
    };
  }
};

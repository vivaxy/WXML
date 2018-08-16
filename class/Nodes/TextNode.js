/**
 * @since 20180808 11:15
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class TextNode extends BaseNode {
  constructor(text) {
    const nodeTypes = require('../../enums/nodeTypes.js');
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

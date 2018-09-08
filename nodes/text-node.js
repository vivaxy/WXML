/**
 * @since 20180808 11:15
 * @author vivaxy
 */

const BaseNode = require('./base-node.js');
const nodeTypes = require('../enums/node-types.js');

module.exports = class TextNode extends BaseNode {
  constructor(text) {
    super(nodeTypes.TEXT);
    this.text = text;
  }

  toJSON() {
    return {
      type: this.type,
      text: this.text,
    };
  }
};

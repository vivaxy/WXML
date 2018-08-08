/**
 * @since 20180808 11:15
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class TextNode extends BaseNode {
  constructor({ type, text }) {
    const nodeTypes = require('../../enums/nodeTypes.js');
    super({ type: nodeTypes.TEXT });
    this.text = text;
  }

  dispose() {
    super.dispose();
    this.text = null;
  }
};

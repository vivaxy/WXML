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

    // cache info
    this.inMustache = false;
  }

  clean() {
    delete this.inMustache;
  }

  dispose() {
    super.dispose();
    this.text = null;
  }

  toString() {
    return this.text;
  }
};

/**
 * @since 20180808 11:11
 * @author vivaxy
 */

const BaseNode = require('./BaseNode.js');

module.exports = class CommentNode extends BaseNode {
  constructor({ type, comment }) {
    const nodeTypes = require('../../enums/nodeTypes.js');
    super({ type: nodeTypes.COMMENT });
    this.comment = comment;
  }

  dispose() {
    super.dispose();
    this.comment = null;
  }
};

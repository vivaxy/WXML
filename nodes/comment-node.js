/**
 * @since 20180808 11:11
 * @author vivaxy
 */

const BaseNode = require('./base-node.js');
const nodeTypes = require('../types/node-types.js');

module.exports = class CommentNode extends BaseNode {
  constructor(comment) {
    super(nodeTypes.COMMENT);
    this.comment = comment;
  }

  toJSON() {
    return {
      type: this.type,
      comment: this.comment,
    };
  }
};

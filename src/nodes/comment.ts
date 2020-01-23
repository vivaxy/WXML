/**
 * @since 20180808 11:11
 * @author vivaxy
 */
import BaseNode from './base';
import NODE_TYPES from '../types/node-types';

export default class CommentNode extends BaseNode {

  public comment: string;

  constructor(comment: string) {
    super(NODE_TYPES.COMMENT);
    this.comment = comment;
  }

  toJSON() {
    return {
      type: this.type,
      comment: this.comment,
    };
  }
};

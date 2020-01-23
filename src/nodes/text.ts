/**
 * @since 20180808 11:15
 * @author vivaxy
 */
import BaseNode from './base';
import NODE_TYPES from '../types/node-types';

export default class TextNode extends BaseNode {
  public textContent: string;

  constructor(text: string) {
    super(NODE_TYPES.TEXT);
    this.textContent = text;
  }

  toJSON() {
    return {
      type: this.type,
      textContent: this.textContent,
    };
  }
}

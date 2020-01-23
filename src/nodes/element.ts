/**
 * @since 20180808 11:08
 * @author vivaxy
 */
import BaseNode from './base';
import TextNode from './text';
import CommentNode from './comment';
import NODE_TYPES from '../types/node-types';

export default class ElementNode extends BaseNode {
  public tagName: string;
  public attrs: {
    [attrName: string]: string | true;
  };
  public childNodes: Array<ElementNode | TextNode | CommentNode>;
  public selfClosing: boolean;

  constructor() {
    super(NODE_TYPES.ELEMENT);
    this.tagName = '';
    this.attrs = {};
    this.childNodes = [];
    this.selfClosing = false;
  }

  toJSON() {
    return {
      type: this.type,
      tagName: this.tagName,
      attrs: this.attrs,
      childNodes: this.childNodes,
    };
  }
}

/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */
import BaseNode from '../nodes/base';
import ElementNode from '../nodes/element';
import TextNode from '../nodes/text';
import CommentNode from '../nodes/comment';
import tokenize, { TYPES } from './parse/tokenize';

export default function parse(input: string) {
  type RootNode = {
    childNodes: BaseNode[];
  };

  const root: RootNode = {
    childNodes: [],
  };

  let parent: RootNode | ElementNode = root;
  let node: BaseNode | null = null;
  let attributeName = '';

  const stateMachine = {
    [TYPES.TEXT](text: string) {
      parent.childNodes.push(new TextNode(text));
    },
    [TYPES.TAG_OPEN](tagName: string, closing: boolean) {
      if (closing) {
        return;
      }
      node = new ElementNode();
      (node as ElementNode).tagName = tagName;
    },
    [TYPES.TAG_CLOSE](closing: boolean, selfClosing: boolean) {
      if (attributeName) {
        (node as ElementNode).attributes[attributeName] = true;
        attributeName = '';
      }
      if (closing && selfClosing) {
        throwError('Unexpected closing with selfClosing. e.g. </tag />');
      }
      if (selfClosing) {
        ensureValidNode();
        (node as ElementNode).selfClosing = true;
        parent.childNodes.push(node as ElementNode);
        node = null;
        return;
      }
      if (closing) {
        node = parent as typeof node;
        parent = node!.parentNode as typeof parent;
        return;
      }
      parent.childNodes.push(node as ElementNode);
      node!.parentNode = parent as BaseNode;
      parent = node as ElementNode;
      node = null;
    },
    [TYPES.ATTRIBUTE_NAME](attrName: string) {
      if (attributeName) {
        (node as ElementNode).attributes[attributeName] = true;
        attributeName = '';
      }
      attributeName = attrName;
    },
    [TYPES.ATTRIBUTE_VALUE](attrValue: string) {
      (node as ElementNode).attributes[attributeName] = attrValue;
      attributeName = '';
    },
    [TYPES.COMMENT](comment: string) {
      parent.childNodes.push(new CommentNode(comment));
    },
  };

  function traverse(type: TYPES, ...args: Array<string | boolean>) {
    const action = stateMachine[type as keyof typeof stateMachine];
    // @ts-ignore
    action(...args);
  }

  function throwError(message: string) {
    throw new Error(message);
  }

  function ensureValidNode() {
    if (!node) {
      throwError('Unexpected null node');
    }
  }

  tokenize(input, traverse);
  return root.childNodes;
}

/**
 * @since 2018-09-08 12:58:35
 * @author vivaxy
 */
import BaseNode from '../nodes/base';
import TextNode from '../nodes/text';
import CommentNode from '../nodes/comment';
import ElementNode from '../nodes/element';
import NODE_TYPES from '../types/node-types';

const serializeByType = {
  [NODE_TYPES.TEXT](node: TextNode): string {
    return node.textContent;
  },
  [NODE_TYPES.COMMENT](node: CommentNode): string {
    return `<!--${node.comment}-->`;
  },
  [NODE_TYPES.ELEMENT](node: ElementNode): string {
    const tagName = node.tagName || '';
    let attrsString = Object.keys(node.attributes)
      .map((name) => {
        if (node.attributes[name] === true) {
          return name;
        }
        return `${name}=${JSON.stringify(node.attributes[name])}`;
      })
      .join(' ');
    if (attrsString) {
      attrsString = ' ' + attrsString;
    }

    if (node.selfClosing) {
      return `<${tagName}${attrsString} />`;
    }

    if (node.childNodes.length) {
      const childNodesString = node.childNodes.map(serialize).join('');

      return `<${tagName || ''}${attrsString}>${childNodesString}</${tagName}>`;
    }

    return `<${tagName}${attrsString}></${tagName}>`;
  },
  // [NODE_TYPES.CDATA_SECTION](node) {
  //   throw new Error('Implement');
  // },
};

export default function serialize(node: BaseNode) {
  if (!serializeByType[node.type]) {
    throw new Error('Unexpected node.type: ' + node.type);
  }
  // @ts-ignore
  return serializeByType[node.type](node);
}

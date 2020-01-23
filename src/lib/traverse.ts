/**
 * @since 2018-09-08 13:03:56
 * @author vivaxy
 */
import BaseNode from '../nodes/base';
import ElementNode from '../nodes/element';
import NODE_TYPES from '../types/node-types';

const NOOP = function() {};
const traverseByType = {
  [NODE_TYPES.TEXT]: NOOP,
  [NODE_TYPES.ELEMENT](node: ElementNode, visitor: Function) {
    node.childNodes.forEach((childNode) => {
      traverse(childNode, visitor, node);
    });
  },
  [NODE_TYPES.COMMENT]: NOOP,
  // [NODE_TYPES.CDATA_SECTION]: NOOP,
};

export default function traverse(
  node: BaseNode,
  visitor: Function,
  parent: BaseNode | null = null
) {
  visitor(node, parent);
  if (!traverseByType[node.type]) {
    throw new Error('Unexpected node.type: ' + node.type);
  }
  // @ts-ignore
  traverseByType[node.type](node, visitor);
}

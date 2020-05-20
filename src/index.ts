/**
 * @since 20180808 10:52
 * @author vivaxy
 */
import parse from './lib/parse';
import _traverse from './lib/traverse';
import _serialize from './lib/serialize';
import NODE_TYPES from './types/node-types';
import BaseNode from './nodes/base';

export { parse, NODE_TYPES };

export function serialize(node: BaseNode) {
  if (Array.isArray(node)) {
    return node
      .map((n) => {
        return _serialize(n);
      })
      .join('');
  }
  return _serialize(node);
}

export function traverse(node: BaseNode, visitor: Function) {
  if (Array.isArray(node)) {
    node.forEach((n) => {
      _traverse(n, visitor);
    });
  } else {
    _traverse(node, visitor);
  }
}

/**
 * @since 20180808 10:52
 * @author vivaxy
 */
import parse from './lib/parse';
import _traverse from './lib/traverse';
import _serialize from './lib/serialize';

export { parse };
// @ts-ignore
export function serialize(node) {
  if (Array.isArray(node)) {
    return node
      .map((n) => {
        return _serialize(n);
      })
      .join('');
  }
  return _serialize(node);
};

//@ts-ignore
export function traverse(node, visitor: Function) {
  if (Array.isArray(node)) {
    node.forEach((n) => {
      _traverse(n, visitor);
    });
  } else {
    _traverse(node, visitor);
  }
};

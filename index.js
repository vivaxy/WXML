/**
 * @since 20180808 10:52
 * @author vivaxy
 */

const parse = require('./lib/parse.js');
const serialize = require('./lib/serialize.js');
const traverse = require('./lib/traverse.js');

exports.parse = parse;
exports.serialize = function(node) {
  if (Array.isArray(node)) {
    return node
      .map((n) => {
        return serialize(n);
      })
      .join('');
  }
  return serialize(node);
};
exports.traverse = function(node, visitor) {
  if (Array.isArray(node)) {
    node.forEach((n) => {
      traverse(n, visitor);
    });
  } else {
    traverse(node, visitor);
  }
};

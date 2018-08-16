/**
 * @since 20180808 10:52
 * @author vivaxy
 */

const parse = require('./lib/parse.js');

exports.parse = parse;

exports.serialize = (root) => {
  return root.toString();
};

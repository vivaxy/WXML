/**
 * @since 20180808 10:52
 * @author vivaxy
 */

const Parser = require('./lib/parser.js');

exports.parse = (wxml) => {
  const parser = new Parser();
  return parser.parse(wxml);
};

exports.serialize = (root) => {};

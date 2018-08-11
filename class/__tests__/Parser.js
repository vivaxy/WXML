/**
 * @since 20180809 14:23
 * @author vivaxy
 */

const test = require('ava');
const Parser = require('../Parser/index.js');

test.skip('parse attrs without space', (t) => {
  const parser = new Parser();

  t.deepEqual(
    getASTValue(parser, `<tag attr1="value1"attr2="value1"></tag>`),
    {}
  );
});

function getASTValue(parser, wxml) {
  return JSON.parse(JSON.stringify(parser.parse(wxml)));
}

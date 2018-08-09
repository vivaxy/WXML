/**
 * @since 20180808 12:28
 * @author vivaxy
 */

const test = require('ava');
const Tokenizer = require('../Tokenizer.js');
const tokenTypes = require('../../enums/tokenTypes.js');

test('parse white space', (t) => {
  const tokenizer = new Tokenizer().parse(` 
  `);

  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.WHITE_SPACE,
    value: ` 
  `,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

test('parse empty file', (t) => {
  const tokenizer = new Tokenizer().parse(``);
  t.deepEqual(getNextToken(tokenizer), { type: tokenTypes.EOF, value: null });
});

test('parse tag', (t) => {
  const tokenizer = new Tokenizer().parse(`<tag></tag>`);
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_END,
    value: '>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_CLOSE_START,
    value: '</',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_END,
    value: '>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

test('parse self close tag', (t) => {
  const tokenizer = new Tokenizer().parse(`<tag/>`);
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_SELF_CLOSE,
    value: '/>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

test('parse self close tag with space', (t) => {
  const tokenizer = new Tokenizer().parse(`<tag />`);
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.WHITE_SPACE,
    value: ' ',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_SELF_CLOSE,
    value: '/>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

test('parse tag with attrs', (t) => {
  const tokenizer = new Tokenizer().parse(`<tag a="1" />`);
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.WHITE_SPACE,
    value: ' ',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: `a`,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EQUAL,
    value: `=`,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.QUOTE,
    value: `"`,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: `1`,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.QUOTE,
    value: `"`,
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.WHITE_SPACE,
    value: ' ',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_SELF_CLOSE,
    value: '/>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

test('parse tag with children', (t) => {
  const tokenizer = new Tokenizer().parse(`<tag><child/></tag>`);
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_END,
    value: '>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_START,
    value: '<',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'child',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_SELF_CLOSE,
    value: '/>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_CLOSE_START,
    value: '</',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TOKEN,
    value: 'tag',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.TAG_END,
    value: '>',
  });
  t.deepEqual(getNextToken(tokenizer), {
    type: tokenTypes.EOF,
    value: null,
  });
});

function getNextToken(tokenizer) {
  return JSON.parse(JSON.stringify(tokenizer.getNextToken()));
}

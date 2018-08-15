/**
 * @since 20180808 11:19
 * @author vivaxy
 */

const tokenTypes = require('../enums/tokenTypes.js');

module.exports = function tokenizer(wxml) {
  let tokens = [];
  let currentToken = null;
  let nextCharIndex = 0;

  while (nextCharIndex < wxml.length) {
    let char = peekChar();

    if (char === ' ' || char === '\n' || char === '\t' || char === '\r') {
      let index = 0;
      let value = '';
      while (char === ' ' || char === '\n' || char === '\t' || char === '\r') {
        value += char;
        index++;
        char = peekChar(index);
      }
      pushToken({ type: tokenTypes.WHITE_SPACE, value });
      continue;
    }

    if (char === '<') {
      if (peekChar(1) === '/') {
        pushToken({
          type: tokenTypes.CLOSE_TAG_START,
          value: '</',
        });
        continue;
      }
      if (peekChar(1) === '!' && peekChar(2) === '-' && peekChar(3) === '-') {
        pushToken({
          type: tokenTypes.COMMENT_START,
          value: '<!--',
        });
        continue;
      }
      pushToken({ type: tokenTypes.OPEN_TAG_START, value: '<' });
      continue;
    }

    if (char === '>') {
      pushToken({ type: tokenTypes.TAG_END, value: '>' });
      continue;
    }

    if (char === '/' && peekChar(1) === '>') {
      pushToken({ type: tokenTypes.OPEN_TAG_SELF_CLOSE, value: '/>' });
      continue;
    }

    if (char === '{' && peekChar(1) === '{') {
      pushToken({ type: tokenTypes.MUSTACHE_START, value: '{{' });
      continue;
    }

    if (char === '}' && peekChar(1) === '}') {
      pushToken({ type: tokenTypes.MUSTACHE_END, value: '}}' });
      continue;
    }

    if (char === '=') {
      pushToken({ type: tokenTypes.EQUAL, value: '=' });
      continue;
    }

    if (char === "'" || char === '"') {
      pushToken({ type: tokenTypes.QUOTE, value: char });
      continue;
    }

    if (char === '-' && peekChar(1) === '-' && peekChar(2) === '>') {
      pushToken({ type: tokenTypes.COMMENT_END, value: '-->' });
      continue;
    }

    pushToken({ type: tokenTypes.NAME, value: char });
  }

  return tokens;

  function peekChar(offset = 0) {
    return wxml[nextCharIndex + offset];
  }

  function pushToken({ type, value }) {
    nextCharIndex += value.length;
    if (
      currentToken &&
      currentToken.type === type &&
      type === tokenTypes.NAME
    ) {
      currentToken.value += value;
    } else {
      const token = { type, value };
      tokens.push(token);
      currentToken = token;
    }
    return currentToken;
  }
};

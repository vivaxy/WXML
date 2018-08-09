/**
 * @since 20180808 11:19
 * @author vivaxy
 */

const Token = require('./Token.js');

const tokenTypes = require('../enums/tokenTypes.js');

module.exports = class Tokenizer {
  constructor() {
    this.wxml = null;
    this.tokens = [];
    this.currentToken = null;
    this.nextCharIndex = 0;

    this.nextTokenIndex = 0;
  }

  parse(wxml) {
    this.wxml = wxml;
    this.tokens = [];
    this.currentToken = null;
    this.nextCharIndex = 0;

    this.nextTokenIndex = 0;
    while (this.nextCharIndex <= this.wxml.length) {
      this._exec();
    }
    return this;
  }

  _peekChar(offset = 0) {
    return this.wxml[this.nextCharIndex + offset];
  }

  _pushToken({ type, value }) {
    this.nextCharIndex += value.length;
    if (
      this.currentToken &&
      this.currentToken.type === type &&
      type === tokenTypes.TOKEN
    ) {
      this.currentToken.value += value;
    } else {
      const token = new Token({ type, value });
      this.tokens.push(token);
      this.currentToken = token;
    }
    if (this.currentToken.type === tokenTypes.EOF) {
      this.currentToken.value = null;
    }
    return this.currentToken;
  }

  _exec() {
    if (this.nextCharIndex > this.wxml.length) {
      throw new Error('Token already end');
    }

    let char = this._peekChar();

    if (char === undefined) {
      return this._pushToken({ type: tokenTypes.EOF, value: ' ' });
    }

    if (char === ' ' || char === '\n') {
      let index = 0;
      let value = '';
      while (char === ' ' || char === '\n') {
        value += char;
        index++;
        char = this._peekChar(index);
      }
      return this._pushToken({ type: tokenTypes.WHITE_SPACE, value });
    }

    if (char === '<') {
      if (this._peekChar(1) === '/') {
        return this._pushToken({
          type: tokenTypes.TAG_CLOSE_START,
          value: '</',
        });
      }
      if (
        this._peekChar(1) === '!' &&
        this._peekChar(2) === '-' &&
        this._peekChar(3) === '-'
      ) {
        return this._pushToken({
          type: tokenTypes.COMMENT_START,
          value: '<!--',
        });
      }
      return this._pushToken({ type: tokenTypes.TAG_START, value: '<' });
    }

    if (char === '>') {
      return this._pushToken({ type: tokenTypes.TAG_END, value: '>' });
    }

    if (char === '/' && this._peekChar(1) === '>') {
      return this._pushToken({ type: tokenTypes.TAG_SELF_CLOSE, value: '/>' });
    }

    if (char === '{' && this._peekChar(1) === '{') {
      return this._pushToken({ type: tokenTypes.MUSTACHE_START, value: '{{' });
    }

    if (char === '}' && this._peekChar(1) === '}') {
      return this._pushToken({ type: tokenTypes.MUSTACHE_END, value: '}}' });
    }

    if (char === '=') {
      return this._pushToken({ type: tokenTypes.EQUAL, value: '=' });
    }

    if (char === "'" || char === '"') {
      return this._pushToken({ type: tokenTypes.QUOTE, value: char });
    }

    if (
      char === '-' &&
      this._peekChar(1) === '-' &&
      this._peekChar(2) === '>'
    ) {
      return this._pushToken({ type: tokenTypes.COMMENT_END, value: '-->' });
    }

    return this._pushToken({ type: tokenTypes.TOKEN, value: char });
  }

  getNextToken() {
    return this.tokens[this.nextTokenIndex++];
  }

  peekNextToken(offset = 0) {
    return this.tokens[this.nextTokenIndex + offset];
  }

  dispose() {
    this.wxml = null;
    this.tokens = null;
    this.currentToken = null;
    this.pos = null;
  }
};

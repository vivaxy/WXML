/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */

const tokenizer = require('./tokenizer.js');
const tokenTypes = require('../enums/tokenTypes.js');
const ElementNode = require('../class/Nodes/ElementNode.js');
const TextNode = require('../class/Nodes/TextNode.js');

module.exports = class Parser {
  constructor() {
    this.root = [];
    this.currentParent = null;
    this.pendingNode = null; // after pendingNode processing open tag, push to currentParent
  }

  dispose() {
    this.tokenizer.dispose();
    this.tokenizer = null;
    this.root = null;
    this.currentParent = null;
    this.pendingNode = null;
  }

  parse(wxml) {
    this.tokens = tokenizer(wxml);
    this.root = { childNodes: [] };
    this.currentParent = this.root;
    this.pendingNode = null;
    this._parse();
    return this.root;
  }

  throwError(message) {
    throw new Error(message);
  }

  _parse() {
    let token;
    let inMustache = false;

    while ((token = this.tokenizer.getNextToken())) {
      if (token.type === tokenTypes.OPEN_TAG_START) {
        token = this.tokenizer.getNextToken();
        if (token.type === tokenTypes.NAME) {
          // find tag end

          let tagName = token.value;
          let attrs = {};

          while ((token = this.tokenizer.getNextToken())) {
            if (token.type === tokenTypes.OPEN_TAG_END && !inMustache) {
              // <tag ....>
              if (!tagName) {
                this.throwError('Expecting tagName');
              }
              this.pendingNode = new ElementNode(tagName);
              this.pendingNode.attrs = attrs;
              break;
            }

            if (token.type === tokenTypes.MUSTACHE_START) {
              if (inMustache) {
                throw new Error('Unexpected error');
              }
              inMustache = true;
              continue;
            }

            if (token.type === tokenTypes.MUSTACHE_END) {
              inMustache = false;
              continue;
            }

            if (token.type === tokenTypes.WHITE_SPACE) {
              continue;
            }

            if (token.type === tokenTypes.OPEN_TAG_SELF_CLOSE) {
              // <tag />
              if (!tagName) {
                this.throwError('Expecting tagName');
              }
              this.pendingNode = new ElementNode(tagName);
              this.pendingNode.selfClosing = true;
              this.pendingNode.attrs = attrs;
              break;
            }

            if (token.type === tokenTypes.NAME) {
            }
          }

          continue;
        }

        this.pendingNode = new TextNode('<' + token.value);
      }
    }
  }
};

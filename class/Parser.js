/**
 * @since 20180808 11:17
 * @author vivaxy
 */

const Tokenizer = require('./Tokenizer.js');
const tokenTypes = require('../enums/tokenTypes.js');
const BaseNode = require('./node/BaseNode.js');
const CommentNode = require('./node/CommentNode.js');
const ElementNode = require('./node/ElementNode.js');
const TextNode = require('./node/TextNode.js');

module.exports = class Parser {
  constructor() {
    this.tokenizer = new Tokenizer();
    this.openStack = [];
    this.root = [];
    this.currentParent = null;
    this.inMustache = false;
    this.textNodeList = [];
  }

  dispose() {
    this.tokenizer.dispose();
    this.tokenizer = null;
    this.openStack = null;
    this.root = null;
    this.currentParent = null;
    this.inMustache = null;
    this.textNodeList = null;
  }

  parse(wxml) {
    this.tokenizer.parse(wxml);
    this.openStack = [];
    this.root = [];
    this.currentParent = this.root;
    this.inMustache = false;
    this.textNodeList = [];
    this._parseNext();
  }

  _parseNext() {
    const token = this.tokenizer.getNextToken();
    this[`_handleToken_${token.type}`](token);
  }

  _appendSiblingNode(node) {
    node.parentNode = this.currentParent;
    this.currentParent.push(node);
  }

  _goInToElementNode(node) {
    this.currentParent = node;
  }

  _goOutOfElementNode(node) {
    this.currentParent = node.parentNode;
  }

  [`_handleToken_${tokenTypes.TAG_START}`](token) {
    if (this.inMustache) {
      // just text
      return this.textNodeList.push(token);
    }

    if (this.tokenizer.peekNextToken().type === tokenTypes.WHITE_SPACE) {
      // is a text node
      return this.textNodeList.push(token);
    }

    if (this.textNodeList.length) {
    }
  }

  [`_handleToken_${tokenTypes.TAG_END}`](token) {}

  [`_handleToken_${tokenTypes.TAG_CLOSE_START}`](token) {}

  [`_handleToken_${tokenTypes.TAG_SELF_CLOSE}`](token) {}

  [`_handleToken_${tokenTypes.MUSTACHE_START}`](token) {}

  [`_handleToken_${tokenTypes.MUSTACHE_END}`](token) {}

  [`_handleToken_${tokenTypes.COMMENT_START}`](token) {}

  [`_handleToken_${tokenTypes.COMMENT_END}`](token) {}

  [`_handleToken_${tokenTypes.WHITE_SPACE}`](token) {}

  [`_handleToken_${tokenTypes.TOKEN}`](token) {}

  [`_handleToken_${tokenTypes.EOF}`](token) {
    // end
  }
};

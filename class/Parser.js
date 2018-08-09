/**
 * @since 20180808 11:17
 * @author vivaxy
 */

const tokenTypes = require('../enums/tokenTypes.js');
const nodeTypes = require('../enums/nodeTypes.js');
const ENCS = require('../enums/elementNodeComposingStates.js');

const Tokenizer = require('./Tokenizer.js');
const CommentNode = require('./nodes/CommentNode.js');
const ElementNode = require('./nodes/ElementNode.js');
const TextNode = require('./nodes/TextNode.js');

module.exports = class Parser {
  constructor() {
    this.tokenizer = new Tokenizer();
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
    this.tokenizer.parse(wxml);
    this.root = { childNodes: [] };
    this.currentParent = this.root;
    this.pendingNode = null;
    this._parseNext();
  }

  _parseNext() {
    const token = this.tokenizer.getNextToken();
    this[`_handleToken_${token.type}`](token);
  }

  _setAttr(value) {
    const pendingNode = this.pendingNode;
    if (!pendingNode.composingAttrName) {
      throw new Error('Error pendingNode.composingAttrName');
    }
    pendingNode.attrs[pendingNode.composingAttrName] = value;
    pendingNode.composingAttrName = null;
  }

  _pushToCurrentParent() {
    this.pendingNode.parentNode = this.currentParent;
    this.currentParent.push(this.pendingNode);
    this.pendingNode = null;
  }

  [`_handleToken_${tokenTypes.TAG_START}`](token) {
    // < tag
    // <"tag
    // <'tag
    // <<
    // <>
    // <=
    if (this.tokenizer.peekNextToken().type !== tokenTypes.TOKEN) {
      // is a text node
      if (!this.pendingNode) {
        this.pendingNode = new TextNode('');
      }
      return (this.pendingNode.text += token.value);
    }

    // <tag
    if (!this.pendingNode) {
      return (this.pendingNode = new ElementNode(null, []));
    }

    // <!-- <tag
    if (this.pendingNode.type === nodeTypes.COMMENT) {
      return (this.pendingNode.comment += token.value);
    }

    // {{ <tag
    // xx <tag
    if (this.pendingNode.type === nodeTypes.TEXT) {
      if (this.pendingNode.inMustache) {
        return (this.pendingNode.text += token.value);
      }

      this._pushToCurrentParent();
      return (this.pendingNode = new ElementNode(null, []));
    }

    // <tag1><tag2
    if (this.pendingNode.type === nodeTypes.ELEMENT) {
      this._pushToCurrentParent();
      this.currentParent = this.pendingNode;
      return (this.pendingNode = new ElementNode(null, []));
    }

    throw new Error('Unexpected branch in ' + token.type + ': ' + token.value);
  }

  [`_handleToken_${tokenTypes.TAG_END}`](token) {
    const pendingNode = this.pendingNode;
    const composingState = pendingNode.composingState;
    if (pendingNode.type === nodeTypes.ELEMENT) {
      if (pendingNode.composingState === ENCS.OPEN_TAG_ATTR_NAME) {
        // <tag>
        return (pendingNode.composingState = ENCS.TAG_CHILDREN);
      }

      if (pendingNode.composingState === ENCS.OPEN_TAG_ATTR_EQUAL) {
        // <tag attr>
        this._setAttr(true);
        return (pendingNode.composingState = ENCS.TAG_CHILDREN);
      }

      if (pendingNode.composingState === ENCS.OPEN_TAG_ATTR_VALUE) {
        // <tag attr=>
        this._setAttr('');
        return (pendingNode.composingState = ENCS.TAG_CHILDREN);
      }

      if (pendingNode.composingState === ENCS.TAG_CHILDREN) {
        // <tag attr>> start a text node
        this._pushToCurrentParent();
        this.currentParent = pendingNode;
        this.pendingNode = new TextNode(token.value);
      }

      if (pendingNode.composingState === ENCS.CLOSE_TAG_NAME) {
        // <tag attr></>
        throw new Error('Unexpected closing tag');
      }

      if (pendingNode.composingState === ENCS.CLOSE_TAG_END) {
        // <tag></tag
        return (this.pendingNode.composingState = ENCS.TAG_END);
      }

      throw new Error(
        'Unexpected pendingNode.composingState:' + pendingNode.composingState
      );
    }

    if (this.pendingNode.type === nodeTypes.TEXT) {
      return (this.pendingNode.text += token.value);
    }

    if (this.pendingNode.type === nodeTypes.COMMENT) {
      return (this.pendingNode.comment += token.value);
    }
  }

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

  [`_handleToken_${tokenTypes.EQUAL}`](token) {}

  [`_handleToken_${tokenTypes.QUOTE}`](token) {}
};

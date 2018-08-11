/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */

const Tokenizer = require('../Tokenizer.js');
const classFactories = [
  require('./mixins/TokenParser.js'),
  require('./mixins/TagStartParser.js'),
  require('./mixins/TagEndParser.js'),
  require('./mixins/TagEndElementParser.js'),
  require('./mixins/TagCloseStartParser.js'),
  require('./mixins/TagSelfCloseParser.js'),
];

class Parser {
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
    if (!this[`_handleToken_${token.type}`]) {
      throw new Error('Unexpected token.type: ' + token.type);
    }
    this[`_handleToken__${token.type}`](token);
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
}

module.exports = classFactories.reduce((prevClass, factory) => {
  return factory(prevClass);
}, Parser);

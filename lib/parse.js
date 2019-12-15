/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */
const ElementNode = require('../nodes/element-node');
const TextNode = require('../nodes/text-node');
const CommentNode = require('../nodes/comment-node');
const tokenize = require('./parse/tokenize');

module.exports = function parse(input) {
  const root = {
    childNodes: [],
  };

  let parent = root;
  let node = null;
  let attributeName = '';

  const stateMachine = {
    [tokenize.TYPES.TEXT](text) {
      parent.childNodes.push(new TextNode(text));
    },
    [tokenize.TYPES.TAG_OPEN](tagName, closing) {
      if (closing) {
        return;
      }
      node = new ElementNode();
      node.tagName = tagName;
    },
    [tokenize.TYPES.TAG_CLOSE](closing, selfClosing) {
      if (attributeName) {
        node.attrs[attributeName] = true;
        attributeName = '';
      }
      if (closing && selfClosing) {
        throwError('Unexpected closing with selfClosing. e.g. </tag />');
      }
      if (selfClosing) {
        ensureValidNode();
        node.selfClosing = true;
        parent.childNodes.push(node);
        node = null;
        return;
      }
      if (closing) {
        ensureValidNode();
        parent = node.parentNode;
        parent.childNodes.push(node);
        node = null;
        return;
      }
      node.parentNode = parent;
      parent = node;
    },
    [tokenize.TYPES.ATTRIBUTE_NAME](attrName) {
      if (attributeName) {
        node.attrs[attributeName] = true;
        attributeName = '';
      }
      attributeName = attrName;
    },
    [tokenize.TYPES.ATTRIBUTE_VALUE](attrValue) {
      node.attrs[attributeName] = attrValue;
      attributeName = '';
    },
    [tokenize.TYPES.COMMENT](comment) {
      parent.childNodes.push(new CommentNode(comment));
    },
  };

  function traverse(type, ...args) {
    const action = stateMachine[type];
    action(...args);
  }

  function throwError(message) {
    throw new Error(message);
  }

  function ensureValidNode() {
    if (!node) {
      throwError('Unexpected null node');
    }
  }

  tokenize(input, traverse);
  return root.childNodes;
};

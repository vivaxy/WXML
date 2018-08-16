/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */

const tokenizer = require('./tokenizer.js');
const tokenTypes = require('../enums/tokenTypes.js');
const ElementNode = require('../Nodes/ElementNode.js');
const TextNode = require('../Nodes/TextNode.js');
const nodeTypes = require('../enums/nodeTypes.js');

const states = {
  FINDING_TAG_START: 'FINDING_TAG_START',
  FINDING_TAG_NAME: 'FINDING_TAG_NAME',
  FINDING_ATTR_NAME: 'FINDING_ATTR_NAME',
  FINDING_ATTR_VALUE: 'FINDING_ATTR_VALUE',
};

module.exports = function parser(wxml) {
  const tokens = tokenizer(wxml);

  const root = {
    isRoot: true,
    childNodes: [],
    toJSON() {
      return {
        isRoot: true,
        childNodes: this.childNodes.map((childNode) => {
          return childNode.toJSON();
        }),
      };
    },
    toString() {
      return this.childNodes
        .map((childNode) => {
          return childNode.toString();
        })
        .join('');
    },
  };

  let parent = root;
  let node = null;
  let attrName = null;
  let attrValue = '';
  let quote = null;
  let i = 0;
  let isClosingTag = false;
  let state = states.FINDING_TAG_START;

  while (i < tokens.length) {
    const token = tokens[i];

    if (state === states.FINDING_TAG_START) {
      if (token.type === tokenTypes.OPEN_TAG_START) {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === tokenTypes.NAME) {
          // save previous tag and start a tag
          if (node) {
            node.parentNode = parent;
            parent.childNodes.push(node);
          }
          node = new ElementNode();
          state = states.FINDING_TAG_NAME;
          i++;
          continue;
        }
      }

      if (token.type === tokenTypes.CLOSE_TAG_START) {
        const nextToken = tokens[i + 1];
        const nextToken2 = tokens[i + 2];
        if (
          nextToken &&
          nextToken.type === tokenTypes.NAME &&
          nextToken.value === parent.tagName &&
          nextToken2 &&
          nextToken2.type === tokenTypes.TAG_END
        ) {
          if (node && node.type === nodeTypes.TEXT) {
            node.parentNode = parent;
            parent.childNodes.push(node);
            parent = parent.parentNode;
            node = null;
          }
          // closing tag
          i += 3;
          // isClosingTag = true;
          continue;
        }
      }
    }

    if (state === states.FINDING_TAG_NAME) {
      if (token.type === tokenTypes.NAME) {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === tokenTypes.WHITE_SPACE) {
          node.tagName = token.value;
          state = states.FINDING_ATTR_NAME;
          i += 2;
          continue;
        }
        if (
          nextToken &&
          (nextToken.type === tokenTypes.TAG_END ||
            nextToken.type === tokenTypes.OPEN_TAG_SELF_CLOSE)
        ) {
          node.tagName = token.value;
          state = states.FINDING_ATTR_NAME;
          i++;
          continue;
        }
      }

      if (token.type === tokenTypes.OPEN_TAG_SELF_CLOSE) {
        // end a self close tag
        onOpenTagSelfClose();
        continue;
      }
    }

    if (state === states.FINDING_ATTR_NAME) {
      if (token.type === tokenTypes.NAME) {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === tokenTypes.EQUAL) {
          attrName = token.value;
          state = states.FINDING_ATTR_VALUE;
          i += 2;
          continue;
        }
      }

      if (token.type === tokenTypes.TAG_END) {
        // end a tag
        state = states.FINDING_TAG_START;
        if (isClosingTag) {
          isClosingTag = false;
          node = parent;
          parent = node.parentNode;
        } else {
          node.parentNode = parent;
          parent.childNodes.push(node);
          parent = node;
          node = null;
        }
        i++;
        continue;
      }

      if (token.type === tokenTypes.WHITE_SPACE) {
        i++;
        continue;
      }

      if (token.type === tokenTypes.OPEN_TAG_SELF_CLOSE) {
        // end a self close tag
        onOpenTagSelfClose();
        continue;
      }
    }

    if (state === states.FINDING_ATTR_VALUE) {
      if (!quote && token.type === tokenTypes.WHITE_SPACE) {
        node.attrs[attrName] = true;
        i++;
        continue;
      }

      if (token.type === tokenTypes.QUOTE) {
        if (quote === null) {
          // start a quote
          quote = token.value;
          i++;
          continue;
        }
        if (quote && token.type === tokenTypes.QUOTE && token.value === quote) {
          // end a quote
          quote = null;
          node.attrs[attrName] = attrValue;
          attrName = null;
          attrValue = '';
          state = states.FINDING_ATTR_NAME;
          i++;
          continue;
        }
      }

      if (quote === "'") {
        // in a quote
        attrValue += token.value;
        i++;
        continue;
      }

      if (quote === '"') {
        // in a quote
        attrValue += token.value;
        i++;
        continue;
      }

      attrValue += token.value;
      i += 2;
      state = states.FINDING_ATTR_NAME;
      continue;
    }

    if (!node) {
      node = new TextNode(token.value);
    } else if (node.type === nodeTypes.TEXT) {
      node.text += token.value;
    } else {
      throwError('Unexpected');
    }
    i++;

    function onOpenTagSelfClose() {
      // end a self close tag
      state = states.FINDING_TAG_START;
      node.isSelfClosing = true;
      node.parentNode = parent;
      parent.childNodes.push(node);
      node = null;
      i++;
    }
  }

  return root;

  function throwError(message) {
    throw new Error(message);
  }
};

/**
 * @since 2018-08-11 15:40:55
 * @author vivaxy
 */

const tokenTypes = require('../../../enums/tokenTypes.js');

const ElementNode = require('../../nodes/ElementNode.js');
const TextNode = require('../../nodes/TextNode.js');

module.exports = (BaseClass) => {
  return class TokenParser extends BaseClass {
    [`_handleToken__${tokenTypes.TAG_START}`](token) {
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

      if (!this[`_handleTagStart_${this.pendingNode.type}`]) {
        throw new Error(
          'Unexpected pendingNode.type: ' + this.pendingNode.type
        );
      }
      this[`_handleTagStart__${this.pendingNode.type}`](token);
    }

    [`_handleToken__${tokenTypes.TAG_END}`](token) {
      if (!this[`_handleTagEnd__${this.pendingNode.type}`]) {
        throw new Error(
          'Unexpected pendingNode.type: ' + this.pendingNode.type
        );
      }
      this[`_handleTagEnd__${this.pendingNode.type}`](token);
    }

    [`_handleToken__${tokenTypes.TAG_CLOSE_START}`](token) {
      if (!this[`_handleTagCloseStart__${this.pendingNode.type}`]) {
        throw new Error(
          'Unexpected pendingNode.type: ' + this.pendingNode.type
        );
      }
      this[`_handleTagCloseStart__${this.pendingNode.type}`](token);
    }

    [`_handleToken__${tokenTypes.TAG_SELF_CLOSE}`](token) {
      if (!this[`_handleTagSelfClose__${this.pendingNode.type}`]) {
        throw new Error(
          'Unexpected pendingNode.type: ' + this.pendingNode.type
        );
      }
      this[`_handleTagSelfClose__${this.pendingNode.type}`](token);
    }

    [`_handleToken__${tokenTypes.MUSTACHE_START}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.MUSTACHE_END}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.COMMENT_START}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.COMMENT_END}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.WHITE_SPACE}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.TOKEN}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.EOF}`](token) {
      // end
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.EQUAL}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }

    [`_handleToken__${tokenTypes.QUOTE}`](token) {
      throw new Error('Unexpected pendingNode.type: ' + this.pendingNode.type);
    }
  };
};

/**
 * @since 2018-08-11 15:51:07
 * @author vivaxy
 */

const nodeTypes = require('../../../enums/nodeTypes.js');

module.exports = (BaseClass) => {
  return class TagEndParser extends BaseClass {
    [`_handleTagEnd__${nodeTypes.ELEMENT}`](token) {
      if (!this[`_handleTagEnd_element__${this.pendingNode.composingState}`]) {
        throw new Error(
          'Unexpected composingState: ' + this.pendingNode.composingState
        );
      }

      this[`_handleTagEnd_element__${this.pendingNode.composingState}`](token);
    }

    [`_handleTagEnd__${nodeTypes.TEXT}`](token) {
      this.pendingNode.text += token.value;
    }

    [`_handleTagEnd__${nodeTypes.COMMENT}`](token) {
      this.pendingNode.comment += token.value;
    }
  };
};

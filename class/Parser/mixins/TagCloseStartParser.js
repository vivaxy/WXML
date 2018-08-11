/**
 * @since 2018-08-11 16:07:59
 * @author vivaxy
 */

const nodeTypes = require('../../../enums/nodeTypes.js');
const ENCS = require('../../../enums/elementNodeComposingStates.js');

module.exports = (BaseClass) => {
  return class TagCloseStartParser extends BaseClass {
    [`_handleTagCloseStart__${nodeTypes.ELEMENT}`](token) {
      // <tag>
      if (this.pendingNode.composingState === ENCS.TAG_CHILDREN) {
        // <tag>
        return (this.pendingNode.composingState = ENCS.CLOSE_TAG_NAME);
      }

      throw new Error(
        'Unexpected pendingNode.composingState: ' +
          this.pendingNode.composingState
      );
    }

    [`_handleTagCloseStart__${nodeTypes.COMMENT}`](token) {
      this.pendingNode.comment += token.value;
    }

    [`_handleTagCloseStart__${nodeTypes.TEXT}`](token) {
      this.pendingNode.text += token.value;
    }
  };
};

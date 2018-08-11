/**
 * @since 2018-08-11 16:37:36
 * @author vivaxy
 */

const nodeTypes = require('../../../enums/nodeTypes.js');
const ENCS = require('../../../enums/elementNodeComposingStates.js');

module.exports = (BaseClass) => {
  return class TagSelfCloseParser extends BaseClass {
    [`_handleTagSelfClose__${nodeTypes.ELEMENT}`](token) {
      if (this.pendingNode.composingState === ENCS.OPEN_TAG_ATTR_NAME) {
        this.pendingNode.composingState = ENCS.TAG_END;
        return (this.pendingNode.isSelfClosing = true);
      }

      if (this.pendingNode.composingState === ENCS.OPEN_TAG_ATTR_EQUAL) {
        this._setAttr(true);
        this.pendingNode.composingState = ENCS.TAG_END;
        return (this.pendingNode.isSelfClosing = true);
      }

      if (this.pendingNode.composingState === ENCS.OPEN_TAG_ATTR_VALUE) {
        this._setAttr('');
        this.pendingNode.composingState = ENCS.TAG_END;
        return (this.pendingNode.isSelfClosing = true);
      }

      throw new Error(
        'Unexpected pendingNode.composingState: ' +
          this.pendingNode.composingState
      );
    }

    [`_handleTagSelfClose__${nodeTypes.COMMENT}`](token) {
      this.pendingNode.comment += token.value;
    }

    [`_handleTagSelfClose__${nodeTypes.TEXT}`](token) {
      this.pendingNode.text += token.value;
    }
  };
};

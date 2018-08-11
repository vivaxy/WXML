/**
 * @since 2018-08-11 16:02:11
 * @author vivaxy
 */

const TextNode = require('../../nodes/TextNode.js');
const ENCS = require('../../../enums/elementNodeComposingStates.js');

module.exports = (BaseClass) => {
  return class TagEndElementParser extends BaseClass {
    [`_handleTagEnd_element__${ENCS.OPEN_TAG_ATTR_NAME}`](token) {
      // <tag>
      this.pendingNode.composingState = ENCS.TAG_CHILDREN;
    }

    [`_handleTagEnd_element__${ENCS.OPEN_TAG_ATTR_EQUAL}`](token) {
      // <tag attr>
      this._setAttr(true);
      this.pendingNode.composingState = ENCS.TAG_CHILDREN;
    }

    [`_handleTagEnd_element__${ENCS.OPEN_TAG_ATTR_VALUE}`](token) {
      // <tag attr=>
      this._setAttr('');
      this.pendingNode.composingState = ENCS.TAG_CHILDREN;
    }

    [`_handleTagEnd_element__${ENCS.TAG_CHILDREN}`](token) {
      // <tag attr>> start a text node
      this._pushToCurrentParent();
      this.currentParent = this.pendingNode;
      this.pendingNode = new TextNode(token.value);
    }

    [`_handleTagEnd_element__${ENCS.CLOSE_TAG_NAME}`](token) {
      // <tag attr></>
      throw new Error('Unexpected closing tag');
    }

    [`_handleTagEnd_element__${ENCS.CLOSE_TAG_END}`](token) {
      // <tag></tag
      this.pendingNode.composingState = ENCS.TAG_END;
    }
  };
};

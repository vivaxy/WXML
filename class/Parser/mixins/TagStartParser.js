/**
 * @since 2018-08-11 15:43:25
 * @author vivaxy
 */

const nodeTypes = require('../../../enums/nodeTypes.js');
const ElementNode = require('../../nodes/ElementNode.js');

module.exports = (BaseClass) => {
  return class TagStartParser extends BaseClass {
    [`_handleTagStart_${nodeTypes.ELEMENT}`](token) {
      // <!-- <tag
      this.pendingNode.comment += token.value;
    }

    [`_handleTagStart_${nodeTypes.TEXT}`](token) {
      // {{ <tag
      // xx <tag
      if (this.pendingNode.inMustache) {
        this.pendingNode.text += token.value;
      } else {
        this._pushToCurrentParent();
        this.pendingNode = new ElementNode(null, []);
      }
    }

    [`_handleTagStart_${nodeTypes.ELEMENT}`](token) {
      // <tag1><tag2
      this._pushToCurrentParent();
      this.currentParent = this.pendingNode;
      return (this.pendingNode = new ElementNode(null, []));
    }
  };
};

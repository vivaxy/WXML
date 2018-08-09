/**
 * @since 20180809 16:36
 * @author vivaxy
 */

exports.NOT_OPEN = 0; //
exports.OPEN_TAG_NAME = 1; // <
exports.OPEN_TAG_ATTR_NAME = 2; // <tag
exports.OPEN_TAG_ATTR_EQUAL = 3; // <tag attr
exports.OPEN_TAG_ATTR_VALUE = 4; // <tag attr=
exports.TAG_CHILDREN = 5; // <tag attr=value>
exports.CLOSE_TAG_NAME = 6; // <tag attr=value></
exports.CLOSE_TAG_END = 7; // <tag attr=value></tag
exports.TAG_END = 8; // <tag attr=value></tag>

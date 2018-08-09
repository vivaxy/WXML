/**
 * @since 20180808 11:25
 * @author vivaxy
 */

exports.TAG_START = 0; // <
exports.TAG_END = 1; // >
exports.TAG_CLOSE_START = 2; // </
exports.TAG_SELF_CLOSE = 4; // />

exports.MUSTACHE_START = 10; // {{
exports.MUSTACHE_END = 11; // }}

exports.COMMENT_START = 20; // <!--
exports.COMMENT_END = 21; // -->

exports.WHITE_SPACE = 30; //

exports.TOKEN = 40;

exports.EOF = 50;

exports.EQUAL = 60;
exports.QUOTE = 61;

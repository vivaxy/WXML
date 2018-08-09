/**
 * @since 20180808 10:56
 * @author vivaxy
 */

module.exports = class BaseNode {
  constructor(type) {
    this.type = type;
    this.parentNode = null;
  }

  clean() {}

  traverse(visitor) {
    visitor(this);
  }

  dispose() {
    this.clean();
    this.type = null;
    this.parentNode = null;
  }

  toString() {
    return '';
  }
};

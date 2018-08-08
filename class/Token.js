/**
 * @since 20180808 11:24
 * @author vivaxy
 */

module.exports = class Token {
  constructor({ type, value }) {
    this.type = type;
    this.value = value;
  }
};

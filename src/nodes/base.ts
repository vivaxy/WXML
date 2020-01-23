/**
 * @since 20180808 10:56
 * @author vivaxy
 */
import NODE_TYPES from '../types/node-types';

export default class BaseNode {

  public type: NODE_TYPES;
  public parentNode: BaseNode | null;

  constructor(type: NODE_TYPES) {
    this.type = type;
    this.parentNode = null;
  }

  toJSON() {
    throw new Error('To be implemented');
  }
};

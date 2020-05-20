/**
 * @since 2020-05-20 20:40
 * @author vivaxy
 */
import * as wxml from '..';

test('should export node types', function() {
  expect(wxml.NODE_TYPES.ELEMENT).toBe(1);
  expect(wxml.NODE_TYPES.TEXT).toBe(3);
  expect(wxml.NODE_TYPES.COMMENT).toBe(8);
});

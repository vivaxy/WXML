/**
 * @since 2019-12-17 01:19
 * @author vivaxy
 */
import NODE_TYPES from '../../types/node-types';
import BaseNode from '../../nodes/base';
import traverse from '../traverse';

test('traverse', async function() {
  const commentNode = {
    type: NODE_TYPES.COMMENT,
  };
  const textNode = {
    type: NODE_TYPES.TEXT,
  };
  const root = {
    type: NODE_TYPES.ELEMENT,
    childNodes: [commentNode, textNode],
  };

  const visited = [
    {
      node: root,
      parent: null,
    },
    {
      node: commentNode,
      parent: root,
    },
    {
      node: textNode,
      parent: root,
    },
  ];
  let i = 0;

  function visitor(node: BaseNode, parent: BaseNode) {
    expect(node).toBe(visited[i].node);
    expect(parent).toBe(visited[i].parent);
    i++;
  }

  // @ts-ignore
  traverse(root, visitor);
});

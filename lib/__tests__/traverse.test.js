/**
 * @since 2019-12-17 01:19
 * @author vivaxy
 */
const traverse = require('../traverse');

test('traverse', async () => {
  const commentNode = {
    type: 'comment',
  };
  const textNode = {
    type: 'text',
  };
  const root = {
    type: 'element',
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

  function visitor(node, parent) {
    expect(node).toBe(visited[i].node);
    expect(parent).toBe(visited[i].parent);
    i++;
  }

  traverse(root, visitor);
});

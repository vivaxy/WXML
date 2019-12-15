/**
 * @since 20180815 14:19
 * @author vivaxy
 */
const path = require('path');
const fse = require('fs-extra');
const runFixtures = require('./helpers/run-fixures');
const parse = require('../parse');

test('parse', async () => {
  function equals(a, b) {
    expect(a).toStrictEqual(b);
  }

  const runTest = async (testCaseBase, testCaseName) => {
    const input = await fse.readFile(
      path.join(testCaseBase, 'input.wxml'),
      'utf8'
    );
    const actualFilePath = path.join(testCaseBase, 'actual.json');
    const actual = parse(input).map((node) => node.toJSON());
    const expectJSON = require(path.join(testCaseBase, 'output.json'));

    if (JSON.stringify(actual) !== JSON.stringify(expectJSON)) {
      await fse.writeFile(actualFilePath, JSON.stringify(actual, null, 2));
    } else {
      await fse.remove(actualFilePath);
    }

    equals(actual, expectJSON);
    return input;
  };

  const onlyCaseName = '';
  const todoTestCaseNames = ['nested-tags-000', 'tag-like-in-mustache-000'];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'parse'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

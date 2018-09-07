/**
 * @since 20180815 14:19
 * @author vivaxy
 */

const test = require('ava');
const path = require('path');
const fse = require('fs-extra');
const runFixtures = require('./helpers/run_fixures.js');
const parse = require('../parse.js');

test('parse', async (t) => {
  const runTest = async (testCaseBase, testCaseName) => {
    const input = await fse.readFile(
      path.join(testCaseBase, 'input.wxml'),
      'utf8'
    );
    const actualFilePath = path.join(testCaseBase, 'actual.json');
    const actual = parse(input).toJSON();
    const expectJSON = require(path.join(testCaseBase, 'output.json'));

    if (JSON.stringify(actual) !== JSON.stringify(expectJSON)) {
      await fse.writeFile(actualFilePath, JSON.stringify(actual, null, 2));
    } else {
      await fse.remove(actualFilePath);
    }

    t.deepEqual(actual, expectJSON, 'caseName: ' + testCaseName);
    return input;
  };

  const onlyCaseName = 'basic';
  const todoTestCaseNames = [
    'comment-node',
    'space-in-open-tag',
    'plain-text',
    'attr-value-without-quote',
    'tag-like-in-mustache',
  ];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'parse'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

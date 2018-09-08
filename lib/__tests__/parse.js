/**
 * @since 20180815 14:19
 * @author vivaxy
 */

const test = require('ava');
const path = require('path');
const fse = require('fs-extra');
const runFixtures = require('./helpers/run-fixures.js');
const parse = require('../parse.js');

test('parse', async (t) => {
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

    t.deepEqual(actual, expectJSON, 'caseName: ' + testCaseName);
    return input;
  };

  const onlyCaseName = '';
  const todoTestCaseNames = [];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'parse'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

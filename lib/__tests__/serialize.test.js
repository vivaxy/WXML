/**
 * @since 2018-09-08 12:50:47
 * @author vivaxy
 */
const path = require('path');
const fse = require('fs-extra');
const runFixtures = require('./helpers/run-fixures');
const serialize = require('../serialize');

test('serialize', async () => {
  function equals(a, b) {
    expect(a).toStrictEqual(b);
  }

  const runTest = async (testCaseBase, testCaseName) => {
    const input = require(path.join(testCaseBase, 'input.json'));
    const actualFilePath = path.join(testCaseBase, 'actual.wxml');
    const actual = input.map(serialize).join('');
    const expect = await fse.readFile(
      path.join(testCaseBase, 'output.wxml'),
      'utf8'
    );

    if (actual !== expect) {
      await fse.writeFile(actualFilePath, actual);
    } else {
      await fse.remove(actualFilePath);
    }

    equals(actual, expect);
    return JSON.stringify(input);
  };

  const onlyCaseName = '';
  const todoTestCaseNames = [];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'serialize'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

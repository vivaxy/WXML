/**
 * @since 2018-09-08 12:50:47
 * @author vivaxy
 */

const path = require('path');
const test = require('ava');
const fse = require('fs-extra');
const runFixtures = require('./helpers/run-fixures.js');
const serialize = require('../serialize.js');

test('serialize', async (t) => {
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

    t.deepEqual(actual, expect, 'caseName: ' + testCaseName);
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

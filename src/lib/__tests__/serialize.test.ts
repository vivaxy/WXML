/**
 * @since 2018-09-08 12:50:47
 * @author vivaxy
 */
import * as path from 'path';
import * as fse from 'fs-extra';
import runFixtures from './helpers/run-fixures';
import serialize from '../serialize';

test('serialize', async function() {
  function equals(a: Object, b: Object) {
    expect(a).toStrictEqual(b);
  }

  async function runTest (testCaseBase: string, testCaseName: string) {
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
  const todoTestCaseNames: string[] = [];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'serialize'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

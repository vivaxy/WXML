/**
 * @since 20180815 14:19
 * @author vivaxy
 */
import * as path from 'path';
import * as fse from 'fs-extra';
import runFixtures from './helpers/run-fixures';
import parse from '../parse';

test('parse', async function () {
  function equals(a: Object, b: Object) {
    expect(a).toStrictEqual(b);
  }

  async function runTest(testCaseBase: string, testCaseName: string) {
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
  const todoTestCaseNames: string[] = [];
  await runFixtures(
    path.join(__dirname, 'fixtures', 'parse'),
    runTest,
    onlyCaseName,
    todoTestCaseNames
  );
});

/**
 * @since 20180815 14:19
 * @author vivaxy
 */

const test = require('ava');
const path = require('path');
const fse = require('fs-extra');
const { parse, serialize } = require('../index.js');

test('parse', async (t) => {
  const cases = ['basic'];

  const parseBaseDir = path.join(__dirname, 'fixtures', 'parse');

  const tests = cases.map((caseName) => {
    const testTask = async () => {
      const inputFilePath = path.join(parseBaseDir, caseName, 'input.wxml');
      const outputFilePath = path.join(parseBaseDir, caseName, 'output.json');
      const input = await fse.readFile(inputFilePath, 'utf8');
      const output = require(outputFilePath);
      t.is(parse(input), output);
    };

    return testTask();
  });

  await Promise.all(tests);
});

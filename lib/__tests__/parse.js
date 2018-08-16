/**
 * @since 20180815 14:19
 * @author vivaxy
 */

const test = require('ava');
const path = require('path');
const fse = require('fs-extra');
const parse = require('../parse.js');

test('parse', async (t) => {
  const parseBaseDir = path.join(__dirname, 'fixtures', 'parse');
  const cases = await fse.readdir(parseBaseDir);

  const tests = cases
    .filter((name) => {
      // return name === 'attrs-without-space';
      return true;
    })
    .map((caseName) => {
      const testTask = async () => {
        const inputFilePath = path.join(parseBaseDir, caseName, 'input.wxml');
        const outputFilePath = path.join(parseBaseDir, caseName, 'output.json');
        const input = await fse.readFile(inputFilePath, 'utf8');
        const output = require(outputFilePath);
        t.deepEqual(parse(input).toJSON(), output, caseName);
      };

      return testTask();
    });

  await Promise.all(tests);
});

/**
 * @since 20180808 12:28
 * @author vivaxy
 */

const test = require('ava');
const path = require('path');
const fse = require('fs-extra');
const tokenizer = require('../tokenizer.js');

test('tokenizer', async (t) => {
  const tokenizerFixtureDir = path.join(__dirname, 'fixtures/tokenizer');
  const cases = await fse.readdir(tokenizerFixtureDir);
  const tasks = cases.map((caseName) => {
    const task = async () => {
      const inputFilePath = path.join(
        tokenizerFixtureDir,
        caseName,
        'input.wxml'
      );
      const outputFilePath = path.join(
        tokenizerFixtureDir,
        caseName,
        'output.json'
      );

      const input = await fse.readFile(inputFilePath, 'utf8');
      const output = require(outputFilePath);

      t.deepEqual(tokenizer(input), output, caseName);
    };

    return task();
  });

  await Promise.all(tasks);
});
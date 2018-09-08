/**
 * @since 20180830 17:41
 * @author vivaxy
 */

const path = require('path');
const fse = require('fs-extra');

module.exports = async (baseDir, runTest, onlyCaseName = '', todos = []) => {
  let testCases = await fse.readdir(baseDir);

  testCases = testCases.filter((x) => {
    if (todos.includes(x)) {
      console.warn('TODO: ' + x);
      return false;
    }
    return true;
  });

  if (onlyCaseName) {
    console.warn('Only test: ' + onlyCaseName);
    testCases = testCases.filter((x) => {
      return x === onlyCaseName;
    });
  }

  const tested = [];
  for (let i = 0; i < testCases.length; i++) {
    const testCaseBaseDir = path.join(baseDir, testCases[i]);
    let inputUniqueKey = null;
    try {
      inputUniqueKey = await runTest(testCaseBaseDir, testCases[i]);
    } catch (e) {
      console.error(
        'Test case failed: ' + testCases[i] + '\n\terror: ' + e.stack
      );
    }
    if (typeof inputUniqueKey !== 'string') {
      throw new Error('Missing returning inputUniqueKey');
    }
    if (inputUniqueKey && tested.includes(inputUniqueKey)) {
      throw new Error(
        `Already tested: ${testCases[i]} same to ${
          testCases[tested.indexOf(inputUniqueKey)]
        }`
      );
    }
    tested.push(inputUniqueKey);
  }
};

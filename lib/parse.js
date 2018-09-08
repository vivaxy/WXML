/**
 * @since 2018-08-11 16:11:25
 * @author vivaxy
 */

const nodeTypes = require('../types/node-types.js');
const ElementNode = require('../nodes/element-node.js');
const TextNode = require('../nodes/text-node.js');
const CommentNode = require('../nodes/comment-node.js');

const states = {
  FINDING_TAG_START: 'FINDING_TAG_START',
  FINDING_TAG_NAME: 'FINDING_TAG_NAME',
  FINDING_ATTR_NAME: 'FINDING_ATTR_NAME',
  FINDING_ATTR_VALUE: 'FINDING_ATTR_VALUE',
};

const codes = ' \n\t\r</!->{}=\'"\\'.split('').reduce((acc, char) => {
  acc[char] = char.charCodeAt(0);
  return acc;
}, {});

module.exports = function parser(input) {
  const root = {
    childNodes: [],
  };

  let parent = root;
  let node = null;
  let attrName = '';
  let attrValue = '';
  let i = 0;
  let state = states.FINDING_TAG_START;

  while (i < input.length) {
    const code = getCode(input, i);

    switch (state) {
      case states.FINDING_TAG_START:
        if (code === codes['<']) {
          const nextCode = getCode(input, i + 1);
          if (
            nextCode === codes['!'] &&
            getCode(input, i + 2) === codes['-'] &&
            getCode(input, i + 3) === codes['-']
          ) {
            /**
             * `<!-- ...... -->`
             *  ^           ^
             *  startIndex  endIndex
             */
            trySaveCurrentNode();
            const endIndex = findEndIndexOfComment(input, i);
            node = new CommentNode(input.slice(i + 4, endIndex));
            i += endIndex + 3;
            continue;
          }

          if (nextCode === codes['/']) {
            /**
             * `<tagName></tagName>`
             *           ^
             */
            trySaveCurrentNode();
            const endTagIndex = findEndTagIndex(input, i + 2);
            if (input.slice(i + 2, endTagIndex).trim() !== parent.tagName) {
              throwError(
                'Tag name not match. Found: ' +
                  input.slice(i + 2, endTagIndex).trim() +
                  ', expecting: ' +
                  parent.tagName
              );
            }

            node = null;
            parent = parent.parentNode;
            state = states.FINDING_TAG_START;
            i = endTagIndex + 1;
            continue;
          }

          /**
           * `<tagName...`
           * Support `< tag-name...`
           */
          trySaveCurrentNode();
          node = new ElementNode();
          const notSpaceStartIndex = findWhiteSpaceEndIndex(input, i + 1);
          state = states.FINDING_TAG_NAME;
          i = notSpaceStartIndex;
          continue;
        }

        if (code === codes['{'] && getCode(input, i + 1) === codes['{']) {
          const mustacheEndIndex = findMustacheEndIndex(input, i + 2);
          createTextNode();
          node.text += input.slice(i, mustacheEndIndex + 2);
          i = mustacheEndIndex + 2;
          continue;
        }

        createTextNode();
        node.text += input.charAt(i);
        i++;
        continue;

      case states.FINDING_TAG_NAME:
        if (isWhiteSpace(code)) {
          /**
           * `<tagName attrName...`
           */
          state = states.FINDING_ATTR_NAME;
          i++;
          continue;
        }

        if (code === codes['>']) {
          /**
           * `<tagName>...`
           *          ^
           */
          trySaveCurrentNode();
          parent = node;
          node = null;
          state = states.FINDING_TAG_START;
          i++;
          continue;
        }

        if (code === codes['/'] && getCode(input, i + 1) === codes['>']) {
          /**
           * `<tagName/>
           * Tag End
           */
          node.selfClosing = true;
          state = states.FINDING_TAG_START;
          i += 2;
          continue;
        }

        if (!node) {
          throwError('Error node');
        }

        node.tagName += input.charAt(i);
        i++;
        continue;

      case states.FINDING_ATTR_NAME:
        if (isWhiteSpace(code) && !attrName) {
          /**
           * `<tagName
           *    attrName`
           */
          i = findWhiteSpaceEndIndex(input, i + 1);
          continue;
        }

        if (isWhiteSpace(code) && attrName) {
          /**
           * `<tagName attrName >`
           * `<tagName attrName = `
           */
          i = findWhiteSpaceEndIndex(input, i + 1);
          const curCode = getCode(input, i);
          if (curCode === codes['=']) {
            /**
             * End of attrName
             * Expecting attrValue
             */
            state = states.FINDING_ATTR_VALUE;
            i++;
            continue;
          }
          /**
           * End of an attrValue
           * And `attrValue === true`
           */
          node.attrs[attrName] = true;
          state = states.FINDING_ATTR_NAME;
          attrName = '';
          continue;
        }

        if (attrName && code === codes['=']) {
          const notWhiteSpaceStartIndex = findWhiteSpaceEndIndex(input, i + 1);
          state = states.FINDING_ATTR_VALUE;
          i = notWhiteSpaceStartIndex;
          continue;
        }

        if (code === codes['>']) {
          /**
           * `<tagName attrName>`
           *                   ^
           * End of open tag
           * Same to `END_OF_OPEN_TAG`
           */
          if (attrName) {
            node.attrs[attrName] = true;
            attrName = '';
          }
          trySaveCurrentNode();
          parent = node;
          node = null;
          state = states.FINDING_TAG_START;
          i++;
          continue;
        }

        if (code === codes['/'] && getCode(input, i + 1) === codes['>']) {
          /**
           * `<tagName attrName="attrValue" />`
           *                                ^
           * End of self closing open tag
           * Same to `END_OF_SELF_CLOSING_OPEN_TAG`
           */
          node.selfClosing = true;
          trySaveCurrentNode();
          node = null;
          state = states.FINDING_TAG_START;
          i += 2;
          continue;
        }

        /**
         * Append to attrName
         */
        attrName += input.charAt(i);
        i++;
        continue;

      case states.FINDING_ATTR_VALUE:
        if (!attrValue && (code === codes["'"] || code === codes['"'])) {
          /**
           * `<tagName attrName="attrValue`
           *                    ^
           */
          const quoteEndIndex = findQuoteEndIndex(input, i + 1, code);
          let attrValue = input.slice(i + 1, quoteEndIndex);
          if (code === codes['"']) {
            /**
             * Replace \" to "
             */
            attrValue = unescapeDoubleQuote(attrValue);
          }
          node.attrs[attrName] = attrValue;
          attrName = '';
          state = states.FINDING_ATTR_NAME;
          i = quoteEndIndex + 1;
          continue;
        }

        if (isWhiteSpace(code)) {
          /**
           * `<tagName attrName=attrValue attrName2`
           *                             ^
           * End of attrValue
           */
          node.attrs[attrName] = attrValue;
          attrName = '';
          attrValue = '';
          state = states.FINDING_ATTR_NAME;
          i++;
          continue;
        }

        if (code === codes['>']) {
          /**
           * `<tagName attrName=attrValue>`
           *                             ^
           * End of open tag
           * Same to `END_OF_OPEN_TAG`
           * So just jump to there
           *
           * Only `<tagName attrName=attrValue/>` means value is `attrValue/`
           */
          node.attrs[attrName] = attrValue;
          attrName = '';
          attrValue = '';
          state = states.FINDING_ATTR_NAME;
          continue;
        }

        /**
         * `<tagName attrName=attrValue`
         *                    ^
         */
        attrValue += input.charAt(i);
        i++;
        continue;
      default:
        throwError('Unexpected state: ' + state);
    }
  }

  trySaveCurrentNode();
  node = null;
  return root.childNodes;

  function trySaveCurrentNode() {
    if (node) {
      node.parentNode = parent;
      parent.childNodes.push(node);
    }
  }

  function createTextNode() {
    if (!node || node.type !== nodeTypes.TEXT) {
      trySaveCurrentNode();
      node = new TextNode('');
    }
  }
};

function isWhiteSpace(code) {
  return (
    code === codes[' '] ||
    code === codes['\n'] ||
    code === codes['\t'] ||
    code === codes['\r']
  );
}

function throwError(message) {
  throw new Error(message);
}

function getCode(input, index) {
  return input.charCodeAt(index);
}

function findEndIndexOfComment(input, startIndex) {
  let i = startIndex;
  while (i < input.length) {
    const code = getCode(input, i);
    if (
      code === codes['-'] &&
      getCode(input, i + 1) === codes['-'] &&
      getCode(input, i + 2) === codes['>']
    ) {
      return i;
    }
    i++;
  }
  throwError('Cannot find comment end');
}

function findWhiteSpaceEndIndex(input, startIndex) {
  let i = startIndex;
  while (i < input.length) {
    const code = getCode(input, i);
    if (!isWhiteSpace(code)) {
      return i;
    }
    i++;
  }
  throwError('Unexpected white space end');
}

function findQuoteEndIndex(input, startIndex, findingCode) {
  let i = startIndex;
  while (i < input.length) {
    const code = getCode(input, i);
    if (code === codes['\\']) {
      i += 2;
      continue;
    }
    if (code === codes['{'] && getCode(input, i + 1) === codes['{']) {
      i = findMustacheEndIndex(input, i + 2) + 2;
      continue;
    }
    if (code === findingCode) {
      return i;
    }
    i++;
  }
  throwError(
    'Unexpected end index of char: ' + String.fromCharCode(findingCode)
  );
}

function findMustacheEndIndex(input, startIndex) {
  let i = startIndex;
  while (i < input.length) {
    if (
      getCode(input, i) === codes['}'] &&
      getCode(input, i + 1) === codes['}']
    ) {
      return i;
    }
    i++;
  }
  throwError('Error expecting mustache end');
}

function unescapeDoubleQuote(input) {
  let i = 0;
  let output = '';
  while (i < input.length) {
    const code = input.charCodeAt(i);
    if (code === codes['\\'] && getCode(input, '"')) {
      output += '"';
      i += 2;
      continue;
    }
    output += input.charAt(i);
    i++;
  }
  return output;
}

function findEndTagIndex(input, startIndex) {
  let i = startIndex;
  while (i < input.length) {
    const code = input.charCodeAt(i);
    if (code === codes['>']) {
      return i;
    }
    i++;
  }
  throwError('Tag end not found');
}

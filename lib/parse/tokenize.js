/**
 * @since 2019-12-11 08:34
 * @author vivaxy
 */
const TYPES = {
  TEXT: 0,
  COMMENT: 1,
  TAG_OPEN: 2,
  TAG_CLOSE: 3,
  ATTRIBUTE_NAME: 4,
  ATTRIBUTE_VALUE: 5,
  MUSTACHE_OPEN: 6,
  MUSTACHE_CLOSE: 7,
};

tokenize.TYPES = TYPES;
module.exports = tokenize;

function tokenize(input, traverse) {
  const CHAR = {
    LT: '<',
    GT: '>',
    EXCLAMATION: '!',
    SLASH: '/',
    MINUS: '-',
    BACK_SLASH: '\\',
    SPACE: ' ',
    TABLE: '\t',
    EQUAL: '=',
    QUESTION: '?',
    SINGLE_QUOTE: "'",
    DOUBLE_QUOTE: '"',
    LEFT_BRACE: '{',
    RIGHT_BRACE: '}',
    LINE_FEED: '\n',
    CARRIAGE_RETURN: '\r',
  };
  const ACTIONS = {
    SPACE: 100,
    LT: 101,
    GT: 102,
    QUOTE: 103,
    EQUAL: 104,
    SLASH: 105,
    EXCLAMATION: 106,
    QUESTION: 107,
    BRACE_LEFT: 108,
    BRACE_RIGHT: 109,
    CHAR: 110,
    MINUS: 111,
    BACK_SLASH: 112,
  };
  const STATES = {
    TEXT: 200,
    TAG_OPEN: 201,
    TAG_NAME: 202,
    ATTRIBUTE_NAME: 203,
    ATTRIBUTE_VALUE: 204,
    COMMENT: 205,
  };
  const CHAR_TO_ACTIONS = {
    [CHAR.SPACE]: ACTIONS.SPACE,
    [CHAR.TABLE]: ACTIONS.SPACE,
    [CHAR.LINE_FEED]: ACTIONS.SPACE,
    [CHAR.CARRIAGE_RETURN]: ACTIONS.SPACE,
    [CHAR.LT]: ACTIONS.LT,
    [CHAR.GT]: ACTIONS.GT,
    [CHAR.DOUBLE_QUOTE]: ACTIONS.QUOTE,
    [CHAR.SINGLE_QUOTE]: ACTIONS.QUOTE,
    [CHAR.EQUAL]: ACTIONS.EQUAL,
    [CHAR.SLASH]: ACTIONS.SLASH,
    [CHAR.EXCLAMATION]: ACTIONS.EXCLAMATION,
    [CHAR.QUESTION]: ACTIONS.QUESTION,
    [CHAR.LEFT_BRACE]: ACTIONS.BRACE_LEFT,
    [CHAR.RIGHT_BRACE]: ACTIONS.BRACE_RIGHT,
    [CHAR.MINUS]: ACTIONS.MINUS,
    [CHAR.BACK_SLASH]: ACTIONS.BACK_SLASH,
  };

  let state = STATES.TEXT;
  let text = '';
  let selfClosing = false;
  let closing = true;
  let quote = '';
  let i = 0;

  function NOOP() {}

  function createUnexpected(state, action) {
    return function unexpected(char) {
      throw new Error(
        'Unexpected char `' +
          char +
          '` in state `' +
          state +
          '` with action `' +
          action +
          '`'
      );
    };
  }

  function addText(char) {
    text += char;
  }

  function ensureEmptyText() {
    if (text) {
      throw new Error('Unexpected text: ' + text);
    }
  }

  const stateMachine = {
    [STATES.TEXT]: {
      [ACTIONS.LT](char) {
        const nextChar = input[i + 1];
        if (nextChar === CHAR.LT || nextChar === CHAR.GT) {
          text += char;
          return;
        }
        if (text) {
          traverse(TYPES.TEXT, text);
          text = '';
        }
        state = STATES.TAG_OPEN;
      },
      [ACTIONS.CHAR](char) {
        addText(char);
        if (i === input.length - 1) {
          // the end
          traverse(TYPES.TEXT, text);
          text = '';
        }
      },
    },
    [STATES.TAG_OPEN]: {
      [ACTIONS.SPACE]: NOOP,
      [ACTIONS.LT]: createUnexpected('TAG_OPEN', 'LT'),
      [ACTIONS.GT]: createUnexpected('TAG_OPEN', 'GT'),
      [ACTIONS.QUOTE]: createUnexpected('TAG_OPEN', 'QUOTE'),
      [ACTIONS.EQUAL]: createUnexpected('TAG_OPEN', 'EQUAL'),
      [ACTIONS.QUESTION]: createUnexpected('TAG_OPEN', 'EQUAL'),
      [ACTIONS.BRACE_LEFT]: createUnexpected('TAG_OPEN', 'BRACE_LEFT'),
      [ACTIONS.BRACE_RIGHT]: createUnexpected('TAG_OPEN', 'BRACE_RIGHT'),
      [ACTIONS.CHAR](char) {
        closing = false;
        state = STATES.TAG_NAME;
        ensureEmptyText();
        text += char;
      },
      [ACTIONS.SLASH]() {
        closing = true;
        state = STATES.TAG_NAME;
      },
      [ACTIONS.EXCLAMATION](char) {
        if (input[i + 1] === CHAR.MINUS && input[i + 2] === CHAR.MINUS) {
          state = STATES.COMMENT;
          // Side effect!
          i += 2;
          return;
        }
        createUnexpected('TAG_OPEN', 'EXCLAMATION')(char);
      },
    },
    [STATES.TAG_NAME]: {
      [ACTIONS.SPACE]() {
        if (!text) {
          // `< div`
          return;
        }
        // end of a tagName
        traverse(TYPES.TAG_OPEN, text, closing);
        text = '';
        state = STATES.ATTRIBUTE_NAME;
      },
      [ACTIONS.GT]() {
        // end of a tag
        traverse(TYPES.TAG_OPEN, text, closing);
        text = '';
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        closing = false;
        selfClosing = false;
        state = STATES.TEXT;
      },
      [ACTIONS.SLASH](char) {
        if (input[i + 1] === CHAR.GT) {
          selfClosing = true;
          return;
        }
        createUnexpected('TAG_NAME', 'SLASH', char);
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.ATTRIBUTE_NAME]: {
      [ACTIONS.SPACE]() {
        if (text) {
          // `<div id `
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = '';
        }
        // `<div  `
      },
      [ACTIONS.EQUAL]() {
        if (text) {
          // `<div id=`
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = '';
        }
        // `<div id =`
        state = STATES.ATTRIBUTE_VALUE;
      },
      [ACTIONS.SLASH](char) {
        if (input[i + 1] === CHAR.GT) {
          // `<div />`
          selfClosing = true;
          return;
        }
        // `<div / ` or `<div /i`
        createUnexpected('ATTRIBUTE_NAME', 'SLASH', char);
      },
      [ACTIONS.GT]() {
        if (text) {
          // `<div id>`
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = '';
        }
        // `<div id >`
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        state = STATES.TEXT;
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.ATTRIBUTE_VALUE]: {
      [ACTIONS.SPACE](char) {
        if (quote) {
          addText(char);
          return;
        }
        if (!text) {
          // `<div id= ` or `<div id  `
          return;
        }
        traverse(TYPES.ATTRIBUTE_VALUE, text);
        text = '';
        state = STATES.ATTRIBUTE_NAME;
      },
      [ACTIONS.QUOTE](char) {
        if (!quote) {
          quote = char;
          return;
        }
        if (quote === char) {
          traverse(TYPES.ATTRIBUTE_VALUE, text);
          quote = '';
          text = '';
          state = STATES.ATTRIBUTE_NAME;
          return;
        }
        addText(char);
      },
      [ACTIONS.GT](char) {
        if (quote) {
          addText(char);
          return;
        }
        // end of a attribute value
        traverse(TYPES.ATTRIBUTE_VALUE, text);
        text = '';
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        closing = false;
        selfClosing = false;
        state = STATES.TEXT;
      },
      [ACTIONS.BACK_SLASH]() {
        if (quote && input[i + 1] === quote) {
          // in quote back slash means to escape next char
          // Side effect!
          text += quote;
          i++;
        }
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.COMMENT]: {
      [ACTIONS.CHAR]: addText,
      [ACTIONS.MINUS](char) {
        if (input[i + 1] === CHAR.MINUS && input[i + 2] === CHAR.GT) {
          // Side effect!
          i += 2;
          traverse(TYPES.COMMENT, text);
          text = '';
          state = STATES.TEXT;
          return;
        }
        addText(char);
      },
    },
  };
  while (i < input.length) {
    const char = input[i];
    const stateHandler = stateMachine[state];
    const actionType = CHAR_TO_ACTIONS[char] || ACTIONS.CHAR;
    const action = stateHandler[actionType] || stateHandler[ACTIONS.CHAR];
    if (action) {
      action(char);
    }
    i++;
  }
}

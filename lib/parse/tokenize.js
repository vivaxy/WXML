/**
 * @since 2019-12-11 08:34
 * @author vivaxy
 */
const TYPES = {
  TEXT: 0,
  COMMENT_OPEN: 1,
  COMMENT: 2,
  COMMENT_CLOSE: 3,
  TAG_OPEN: 4,
  TAG_CLOSE: 5,
  ATTRIBUTE_NAME: 6,
  ATTRIBUTE_VALUE: 7,
  MUSTACHE_OPEN: 8,
  MUSTACHE_CLOSE: 9,
};

exports.TYPES = TYPES;
exports.tokenize = function tokenize(input, traverse) {
  const CHAR = {
    LT: '<',
    GT: '>',
    EXCLAMATION: '!',
    SLASH: '/',
    MINUS: '-',
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
  };
  /*
[ACTIONS.SPACE]() {},
[ACTIONS.LT]() {},
[ACTIONS.GT]() {},
[ACTIONS.QUOTE]() {},
[ACTIONS.EQUAL]() {},
[ACTIONS.SLASH]() {},
[ACTIONS.EXCLAMATION]() {},
[ACTIONS.QUESTION]() {},
[ACTIONS.BRACE_LEFT]() {},
[ACTIONS.BRACE_RIGHT]() {},
[ACTIONS.CHAR]() {},
   */
  const CHAR_TO_ACTIONS = {
    ' ': ACTIONS.SPACE,
    '\t': ACTIONS.SPACE,
    '\n': ACTIONS.SPACE,
    '\r': ACTIONS.SPACE,
    [CHAR.LT]: ACTIONS.LT,
    [CHAR.GT]: ACTIONS.GT,
    '"': ACTIONS.QUOTE,
    "'": ACTIONS.QUOTE,
    '=': ACTIONS.EQUAL,
    [CHAR.SLASH]: ACTIONS.SLASH,
    [CHAR.EXCLAMATION]: ACTIONS.EXCLAMATION,
    '?': ACTIONS.QUESTION,
    '{': ACTIONS.BRACE_LEFT,
    '}': ACTIONS.BRACE_RIGHT,
  };
  const STATES = {
    TEXT: 200,
    TAG_OPEN: 201,
    TAG_NAME: 202,
    TAG_NAME_END: 203,
    ATTRIBUTE_NAME: 204,
    ATTRIBUTE_NAME_END: 205,
    ATTRIBUTE_VALUE: 206,
    COMMENT: 207,
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
    text = char;
  }

  function unexpectedText() {
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
        }
        state = STATES.TAG_OPEN;
      },
      [ACTIONS.CHAR]: addText,
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
        state = STATES.TAG_NAME;
        unexpectedText();
        text += char;
      },
    },
    [STATES.TAG_NAME]: {
      [ACTIONS.SPACE]() {
        // end of a tagName
        if (text[0] === CHAR.SLASH) {
          traverse(TYPES.TAG_CLOSE, text);
          closing = true;
          text = '';
          state = STATES.TAG_NAME_END;
          return;
        }
        if (
          text[0] === CHAR.EXCLAMATION &&
          text[1] === CHAR.MINUS &&
          text[2] === CHAR.MINUS
        ) {
          traverse(TYPES.COMMENT_OPEN);
          state = STATES.COMMENT;
          text = text.slice(3);
          return;
        }

        traverse(TYPES.TAG_OPEN, text);
        text = '';
        state = STATES.TAG_NAME_END;
      },
      [ACTIONS.GT]() {
        // end of a tag
        traverse(TYPES.TAG_CLOSE, text, closing, selfClosing);
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
    [STATES.TAG_NAME_END]: {
      [ACTIONS.SPACE]: NOOP,
      [ACTIONS.CHAR](char) {
        unexpectedText();
        state = STATES.ATTRIBUTE_NAME;
        addText(char);
      },
      [ACTIONS.SLASH](char) {
        if (input[i + 1] === CHAR.GT) {
          selfClosing = true;
          return;
        }
        createUnexpected('TAG_NAME_END', 'SLASH', char);
      },
    },
    [STATES.ATTRIBUTE_NAME]: {
      [ACTIONS.SPACE]() {
        traverse(TYPES.ATTRIBUTE_NAME, text);
        text = '';
        state = STATES.ATTRIBUTE_NAME_END;
      },
      [ACTIONS.EQUAL]() {
        traverse(TYPES.ATTRIBUTE_NAME, text);
        text = '';
        state = STATES.ATTRIBUTE_VALUE;
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.ATTRIBUTE_NAME_END]: {
      [ACTIONS.EQUAL]() {
        state = STATES.ATTRIBUTE_VALUE;
      },
      [ACTIONS.SPACE]: NOOP,
      [ACTIONS.CHAR](char) {
        unexpectedText();
        state = STATES.ATTRIBUTE_NAME;
        addText(char);
      },
    },
    [STATES.ATTRIBUTE_VALUE]: {
      [ACTIONS.SPACE](char) {
        if (quote) {
          addText(char);
          return;
        }
        traverse(TYPES.ATTRIBUTE_VALUE, text);
        text = '';
        state = STATES.TAG_NAME_END;
      },
      [ACTIONS.QUOTE](char) {
        if (quote === char) {
          traverse(TYPES.ATTRIBUTE_VALUE, text);
          text = '';
          state = STATES.TAG_NAME_END;
          return;
        }
        addText(char);
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.COMMENT]: {
      [ACTIONS.CHAR]: addText,
      [ACTIONS.GT](char) {
        if (
          text[text.length - 1] === CHAR.MINUS &&
          text[text.length - 2] === CHAR.MINUS
        ) {
          text = text.slice(0, -2);
          traverse(TYPES.COMMENT, text);
          traverse(TYPES.COMMENT_CLOSE);
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
  }
};

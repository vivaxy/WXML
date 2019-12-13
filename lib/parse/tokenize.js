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

exports.TYPES = TYPES;
exports.tokenize = function tokenize(input, traverse) {
  const CHAR = {
    LT: '<',
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
[ACTIONS.SPACE](char) {},
[ACTIONS.LT](char) {},
[ACTIONS.GT](char) {},
[ACTIONS.QUOTE](char) {},
[ACTIONS.EQUAL](char) {},
[ACTIONS.SLASH](char) {},
[ACTIONS.EXCLAMATION](char) {},
[ACTIONS.QUESTION](char) {},
[ACTIONS.BRACE_LEFT](char) {},
[ACTIONS.BRACE_RIGHT](char) {},
[ACTIONS.CHAR](char) {},
   */
  const CHAR_TO_ACTIONS = {
    ' ': ACTIONS.SPACE,
    '\t': ACTIONS.SPACE,
    '\n': ACTIONS.SPACE,
    '\r': ACTIONS.SPACE,
    [CHAR.LT]: ACTIONS.LT,
    '>': ACTIONS.GT,
    '"': ACTIONS.QUOTE,
    "'": ACTIONS.QUOTE,
    '=': ACTIONS.EQUAL,
    '/': ACTIONS.SLASH,
    '!': ACTIONS.EXCLAMATION,
    '?': ACTIONS.QUESTION,
    '{': ACTIONS.BRACE_LEFT,
    '}': ACTIONS.BRACE_RIGHT,
  };
  const STATES = {
    TEXT: 200,
    TAG_OPEN: 202,
    TAG_CLOSE: 203,
    TAG_NAME: 204,
    TAG_VALUE: 205,
  };

  let state = STATES.TEXT;
  let text = '';
  let i = 0;

  function NOOP() {}

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
      [ACTIONS.CHAR](char) {
        text += char;
      },
    },
    [STATES.TAG_OPEN]: {
      [ACTIONS.SPACE]: NOOP,
      [ACTIONS.LT]() {
        throw new Error(
          'Unexpected char `' +
            CHAR.LT +
            '` in state `' +
            STATES.TAG_OPEN +
            '` with action `' +
            ACTIONS.LT +
            '`'
        );
      },
      [ACTIONS.GT](char) {},
      [ACTIONS.QUOTE](char) {},
      [ACTIONS.EQUAL](char) {},
      [ACTIONS.SLASH](char) {},
      [ACTIONS.EXCLAMATION](char) {},
      [ACTIONS.QUESTION](char) {},
      [ACTIONS.BRACE_LEFT](char) {},
      [ACTIONS.BRACE_RIGHT](char) {},
      [ACTIONS.CHAR](char) {},
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

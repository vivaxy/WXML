/**
 * @since 2019-12-11 08:34
 * @author vivaxy
 */
export enum TYPES {
  TEXT,
  COMMENT,
  TAG_OPEN,
  TAG_CLOSE,
  ATTRIBUTE_NAME,
  ATTRIBUTE_VALUE,

  // start of mustache
  MUSTACHE_OPEN,
  MUSTACHE_CLOSE,
  // end of mustache
}

interface Traverse {
  (type: TYPES.TEXT, value: string): void;
  (type: TYPES.TAG_OPEN, value: string, selfClosing: boolean): void;
  (type: TYPES.TAG_CLOSE, closing: boolean, selfClosing: boolean): void;
  (type: TYPES.ATTRIBUTE_NAME, value: string): void;
  (type: TYPES.ATTRIBUTE_VALUE, value: string): void;
  (type: TYPES.COMMENT, value: string): void;
}

export default function tokenize(input: string, traverse: Traverse) {
  enum CHAR {
    LT = '<',
    GT = '>',
    EXCLAMATION = '!',
    SLASH = '/',
    MINUS = '-',
    BACK_SLASH = '\\',
    SPACE = ' ',
    TABLE = '\t',
    EQUAL = '=',
    QUESTION = '?',
    SINGLE_QUOTE = "'",
    DOUBLE_QUOTE = '"',
    LINE_FEED = '\n',
    CARRIAGE_RETURN = '\r',
    // start of mustache
    BRACE_LEFT = '{',
    BRACE_RIGHT = '}',
    // end of mustache
  }
  enum ACTIONS {
    SPACE,
    LT,
    GT,
    QUOTE,
    EQUAL,
    SLASH,
    EXCLAMATION,
    QUESTION,
    CHAR,
    MINUS,
    BACK_SLASH,
    // start of mustache
    BRACE_LEFT,
    BRACE_RIGHT,
    // end of mustache
  }
  enum STATES {
    TEXT,
    TAG_OPEN,
    TAG_NAME,
    ATTRIBUTE_NAME,
    ATTRIBUTE_VALUE,
    COMMENT,
  }
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
    [CHAR.MINUS]: ACTIONS.MINUS,
    [CHAR.BACK_SLASH]: ACTIONS.BACK_SLASH,
    // start of mustache
    [CHAR.BRACE_LEFT]: ACTIONS.BRACE_LEFT,
    [CHAR.BRACE_RIGHT]: ACTIONS.BRACE_RIGHT,
    // end of mustache
  };

  let state: STATES = STATES.TEXT;
  let text: string = '';
  let selfClosing: boolean = false;
  let closing: boolean = true;
  let quote: string = '';
  let i: number = 0;
  // start of mustache
  let mustache: boolean = false;
  // end of mustache

  function NOOP() {}

  function createUnexpected(state: string, action: string) {
    return function unexpected(char: string) {
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

  function addText(char: string) {
    text += char;
  }

  function ensureEmptyText() {
    if (text) {
      throw new Error('Unexpected text: ' + text);
    }
  }

  const stateMachine = {
    [STATES.TEXT]: {
      [ACTIONS.LT](char: string) {
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
      [ACTIONS.CHAR](char: string) {
        addText(char);
        if (i === input.length - 1) {
          // the end
          traverse(TYPES.TEXT, text);
          text = '';
        }
      },
      // start of mustache
      [ACTIONS.BRACE_LEFT](char: string) {
        if (input[i + 1] === CHAR.BRACE_LEFT) {
          mustache = true;
          text += char + char;
          // Side effect!
          i++;
          return;
        }
        text += char;
      },
      [ACTIONS.BRACE_RIGHT](char: string) {
        if (input[i + 1] === CHAR.BRACE_RIGHT) {
          mustache = false;
          text += char + char;
          // Side effect!
          i++;
          return;
        }
        text += char;
      },
      // end of mustache
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
      [ACTIONS.CHAR](char: string) {
        closing = false;
        state = STATES.TAG_NAME;
        ensureEmptyText();
        text += char;
      },
      [ACTIONS.SLASH]() {
        closing = true;
        state = STATES.TAG_NAME;
      },
      [ACTIONS.EXCLAMATION](char: string) {
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
      [ACTIONS.SLASH](char: string) {
        if (input[i + 1] === CHAR.GT) {
          selfClosing = true;
          return;
        }
        createUnexpected('TAG_NAME', 'SLASH')(char);
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
      [ACTIONS.SLASH](char: string) {
        if (input[i + 1] === CHAR.GT) {
          // `<div />`
          selfClosing = true;
          return;
        }
        // `<div / ` or `<div /i`
        createUnexpected('ATTRIBUTE_NAME', 'SLASH')(char);
      },
      [ACTIONS.GT]() {
        if (text) {
          // `<div id>`
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = '';
        }
        // `<div id >`
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        selfClosing = false;
        state = STATES.TEXT;
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.ATTRIBUTE_VALUE]: {
      [ACTIONS.SPACE](char: string) {
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
      [ACTIONS.QUOTE](char: string) {
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
      [ACTIONS.GT](char: string) {
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
      [ACTIONS.MINUS](char: string) {
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

  // start of mustache
  const textLTHandler = stateMachine[STATES.TEXT][ACTIONS.LT];
  stateMachine[STATES.TEXT][ACTIONS.LT] = function(char) {
    if (mustache) {
      text += char;
      return;
    }
    textLTHandler(char);
  };
  // end of mustache

  while (i < input.length) {
    const char = input[i];
    const stateHandler = stateMachine[state];
    const actionType =
      char in CHAR_TO_ACTIONS
        ? CHAR_TO_ACTIONS[char as keyof typeof CHAR_TO_ACTIONS]
        : ACTIONS.CHAR;
    const action =
      actionType in stateHandler
        ? stateHandler[actionType as keyof typeof stateHandler]
        : stateHandler[ACTIONS.CHAR];
    if (action) {
      action(char);
    }
    i++;
  }
}

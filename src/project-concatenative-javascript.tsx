// Project page local ../posts/project-concatenative-javascript.mdx
// Github
// https://github.com/reedspool/reeds-website/blob/main/posts/project-concatenative-javascript.mdx
// Live reeds.website/project-concatenative-javascript
type Dictionary = {
  name: string;
  prev: Dictionary | null;
  impl?: ({ ctx }: { ctx: Context }) => void | false;
  immediateImpl?: Dictionary["impl"];
  compiledWordImpls?: (Dictionary["impl"] | unknown)[];
};
let latest: Dictionary | null = null;
type Context = {
  me: Element | unknown;
  parameterStack: unknown[];
  returnStack: {
    dictionaryEntry: Dictionary;
    i: number;
  }[];
  inputStream: string;
  paused: boolean;
  halted: boolean;
  inputStreamPointer: number;
  interpreter: "queryWord" | "compileWord" | "executeColonDefinition";
  pop: () => Context["parameterStack"][0];
  push: (...args: Context["parameterStack"]) => void;
  peek: () => Context["parameterStack"][0];
};
const newCtx: () => Context = () => {
  return {
    me: null,
    parameterStack: [],
    returnStack: [],
    inputStream: "",
    paused: false,
    halted: false,
    inputStreamPointer: 0,
    interpreter: "queryWord",
    pop() {
      if (this.parameterStack.length < 1) throw new Error("Stack underflow");
      return this.parameterStack.pop();
    },
    peek() {
      return this.parameterStack[this.parameterStack.length - 1];
    },
    push(...args: unknown[]) {
      this.parameterStack.push(...args);
    },
  };
};

function define({ name, impl, immediateImpl }: Omit<Dictionary, "prev">) {
  // TODO: Right now, there's only one global dictionary which is shared
  //       across all contexts. Considering how this might be isolated to
  //       a context object. Seems wasteful to copy "core" functions like those
  //       defined in JavaScript below across many dictionaries.
  const prev = latest;
  latest = { prev, name, impl, immediateImpl };
}

define({
  name: "swap",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    ctx.push(a);
    ctx.push(b);
  },
});
define({
  name: "over",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    ctx.push(b);
    ctx.push(a);
    ctx.push(b);
  },
});

define({
  name: "rot",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    const c = ctx.pop();
    ctx.push(b);
    ctx.push(a);
    ctx.push(c);
  },
});

define({
  name: "-rot",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    const c = ctx.pop();
    ctx.push(a);
    ctx.push(c);
    ctx.push(b);
  },
});
define({
  name: "dup",
  impl: ({ ctx }) => {
    ctx.push(ctx.peek());
  },
});
define({
  name: "drop",
  impl: ({ ctx }) => {
    ctx.pop();
  },
});
define({
  name: "me",
  impl: ({ ctx }) => {
    ctx.push(ctx.me);
  },
});
define({
  name: "'",
  impl: ({ ctx }) => {
    // Move cursor past the blank space between
    ctx.inputStreamPointer++;
    const text = consume({ until: "'", including: true, ctx });
    ctx.push(text);
  },
  immediateImpl: ({ ctx }) => {
    const text = consume({ until: "'", including: true, ctx });

    latest!.compiledWordImpls!.push((({ ctx }) => {
      ctx.push(text);
    }) as Dictionary["impl"]);
  },
});
define({
  name: ">text",
  impl: ({ ctx }) => {
    (ctx.pop() as HTMLElement).innerText = ctx.pop()!.toString();
  },
});

define({
  name: "&&",
  impl: ({ ctx }) => {
    const b = ctx.pop();
    const a = ctx.pop();
    ctx.push(a && b);
  },
});

define({
  name: "||",
  impl: ({ ctx }) => {
    const b = ctx.pop();
    const a = ctx.pop();
    ctx.push(a || b);
  },
});

define({
  name: "log",
  impl: ({ ctx }) => {
    console.log(ctx.pop());
  },
});

define({
  name: "typeof",
  impl: ({ ctx }) => {
    const b = ctx.pop();
    const a = ctx.pop();
    ctx.push(typeof a === b);
  },
});

define({
  name: "now",
  impl: ({ ctx }) => {
    ctx.push(Date.now());
  },
});

function defineBinaryExactlyAsInJS({ name }: { name: Dictionary["name"] }) {
  const binary = new Function("a", "b", `return a ${name} b;`);
  define({
    name,
    impl: ({ ctx }) => {
      const b = ctx.pop();
      const a = ctx.pop();
      ctx.push(binary(a, b));
    },
  });
}

defineBinaryExactlyAsInJS({ name: "==" });
defineBinaryExactlyAsInJS({ name: "===" });
defineBinaryExactlyAsInJS({ name: "+" });
defineBinaryExactlyAsInJS({ name: "-" });
defineBinaryExactlyAsInJS({ name: "*" });
defineBinaryExactlyAsInJS({ name: "/" });
defineBinaryExactlyAsInJS({ name: "<" });
defineBinaryExactlyAsInJS({ name: ">" });
defineBinaryExactlyAsInJS({ name: ">=" });
defineBinaryExactlyAsInJS({ name: "<=" });

define({
  name: ":",
  impl: ({ ctx }) => {
    let dictionaryEntry: typeof latest;

    const name = consume({ until: /\s/, ignoreLeadingWhitespace: true, ctx });
    define({
      name,
      impl: ({ ctx }) => {
        ctx.interpreter = "executeColonDefinition";
        ctx.returnStack.push({ dictionaryEntry: dictionaryEntry!, i: 0 });
      },
    });
    dictionaryEntry = latest;
    dictionaryEntry!.compiledWordImpls = [];
    ctx.interpreter = "compileWord";
  },
});

define({
  name: ";",
  immediateImpl: ({ ctx }) => {
    latest!.compiledWordImpls!.push((({ ctx }) => {
      ctx.returnStack.pop();

      // If we're back to the top-level, outside colon definitions
      if (ctx.returnStack.length < 1) ctx.interpreter = "queryWord";
    }) as Dictionary["impl"]);

    // TODO: Should this instead be a stack and pop to the last interpreter?
    //       That is, was it ever a different interpeter previously?
    ctx.interpreter = "queryWord";
  },
});


define({
  name: "lit",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.returnStack.pop()!;

    const literal = dictionaryEntry?.compiledWordImpls![i];

    ctx.push(literal);

    ctx.returnStack.push({ dictionaryEntry, i: i + 1 });
  },
});
define({
  name: "variable",
  impl: ({ ctx }) => {
    const name = consume({ until: /\s/, ignoreLeadingWhitespace: true, ctx });
    // This variable is actually going to be the
    // value of the variable, via JavaScript closures
    let value: unknown;
    define({
      name,
      impl: ({ ctx }) => {
        // Naming the variable puts this special
        // getter/setter object onto the stack
        // and then the @ word will access the getter
        // and the ! word will use the setter
        // TODO Could we use the dictionary entry object itself for this?
        const variable: Variable = {
          getter: () => value,
          setter: (_value: unknown) => (value = _value),
        };
        ctx.push(variable);
      },
    });
  },
});

type Variable = {
  getter: () => unknown;
  setter: (_value: unknown) => void;
};

define({
  name: "!",
  impl: ({ ctx }) => {
    const b = ctx.pop() as Variable;
    const a = ctx.pop();
    if (!b.setter || typeof b.setter !== "function")
      throw new Error("Can only use word '!' on a variable");
    b.setter(a);
  },
});

define({
  name: "@",
  impl: ({ ctx }) => {
    const a = ctx.pop() as Variable;
    if (!a.getter || typeof a.getter !== "function")
      throw new Error("Can only use word '@' on a variable");
    ctx.push(a.getter());
  },
});

define({
  name: "sleep",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    setTimeout(() => {
      ctx.paused = false;
      query({ ctx });
    }, a as number);

    ctx.paused = true;
  },
});

define({
  name: "debugger",
  impl: ({ ctx }) => {
    console.log("Interpreter paused with context:", ctx);
    debugger;
  },
});

function findDictionaryEntry({ word }: { word: Dictionary["name"] }) {
  let entry = latest;

  while (entry) {
    if (entry.name == word) return entry;
    entry = entry.prev;
  }

  return undefined;
}

function wordAsPrimitive({ word }: { word: Dictionary["name"] }) {
  let value;
  if (word.match(/^-?\d+$/)) {
    value = parseInt(word, 10);
  } else if (word.match(/^-?\d+(\.\d+)?$/)) {
    value = parseFloat(word);
  } else if (word === "true") {
    value = true;
  } else if (word === "false") {
    value = false;
  } else {
    return { isPrimitive: false };
  }

  return { isPrimitive: true, value };
}

function queryWord({ word, ctx }: { word: Dictionary["name"]; ctx: Context }) {
  const dictionaryEntry = findDictionaryEntry({ word });

  if (dictionaryEntry) {
    return dictionaryEntry!.impl!({ ctx });
  } else {
    const primitiveMaybe = wordAsPrimitive({ word });

    if (primitiveMaybe.isPrimitive) {
      ctx.push(primitiveMaybe.value);
    } else {
      throw new Error(`Couldn't comprehend word '${word}'`);
    }
  }
}

function compileWord({
  word,
  ctx,
}: {
  word: Dictionary["name"];
  ctx: Context;
}) {
  const dictionaryEntry = findDictionaryEntry({ word });

  if (dictionaryEntry) {
    if (dictionaryEntry.immediateImpl) {
      dictionaryEntry.immediateImpl({ ctx });
    } else {
      latest!.compiledWordImpls!.push(dictionaryEntry.impl);
    }
  } else {
    const primitiveMaybe = wordAsPrimitive({ word });

    if (primitiveMaybe.isPrimitive) {
      latest!.compiledWordImpls!.push(
        findDictionaryEntry({ word: "lit" })!.impl,
      );
      latest!.compiledWordImpls!.push(primitiveMaybe.value);
    } else {
      throw new Error(`Couldn't comprehend word '${word}'`);
    }
  }
}

function executeColonDefinition({ ctx }: { ctx: Context }) {
  if (ctx.returnStack.length < 1) throw new Error("Return stack underflow");
  const stackFrame = ctx.returnStack.pop();
  if (!stackFrame) throw new Error("Return stack underflow ?");
  const { dictionaryEntry, i } = stackFrame;
  ctx.returnStack.push({ dictionaryEntry, i: i + 1 });
  const callable = dictionaryEntry!.compiledWordImpls![i]!;
  if (typeof callable !== "function")
    throw new Error("Attempted to execute a non-function definition");
  callable({ ctx });
}

function consume({
  until,
  including,
  ctx,
  ignoreLeadingWhitespace,
}: {
  until: RegExp | string;
  including?: boolean;
  ctx: Context;
  ignoreLeadingWhitespace?: boolean;
}) {
  if (ignoreLeadingWhitespace) {
    consume({ until: /\S/, ctx });
  }
  let value = "";
  while (ctx.inputStreamPointer < ctx.inputStream.length) {
    const char = ctx.inputStream[ctx.inputStreamPointer];
    if (!char) throw new Error("Input stream overflow");
    if (typeof until === "string" && char === until) break;
    if (typeof until !== "string" && until.test(char)) break;
    ctx.inputStreamPointer++;
    // TODO I bet this could be optimized a lot simply by first searching for the first instance of until and then taking a substring.
    value += char;
  }
  if (including) ctx.inputStreamPointer++;
  // Strip out escape sequences
  value = value.replaceAll(
    /\\([^\\])/g,
    (_: string, nonEscapeChar: string) => nonEscapeChar,
  );
  return value;
}

function execute({ ctx }: { ctx: Context }) {
  const { interpreter } = ctx;

  if (interpreter === "queryWord" || interpreter === "compileWord") {
    if (ctx.inputStreamPointer >= ctx.inputStream.length) {
      // No input left to process
      ctx.halted = true;
      return;
    }

    const word = consume({ until: /\s/, ignoreLeadingWhitespace: true, ctx });

    // Input only had whitespace
    if (!word.match(/\S/)) return;

    if (interpreter === "queryWord") return queryWord({ word, ctx });
    return compileWord({ word, ctx });
  } else if (interpreter === "executeColonDefinition") {
    executeColonDefinition({ ctx });
  }
}

function query({ ctx }: { ctx: Context }) {
  while (!ctx.halted && !ctx.paused) {
    execute({ ctx });
  }
}

document.querySelectorAll("[c]").forEach((el: Element) => {
  const inputStream = el.getAttribute("c")!;
  const ctx = { ...newCtx(), me: el, inputStream };
  try {
    query({
      ctx,
    });
  } catch (error) {
    console.error(`Error in script:\n\n'${inputStream}'`);
    console.error(error);
    console.error("Context after error", ctx);
  }
});

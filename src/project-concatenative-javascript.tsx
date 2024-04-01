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
  isImmediate?: boolean;
};
let latest: Dictionary | null = null;
type Context = {
  me: Element | unknown;
  parameterStack: unknown[];
  returnStack: {
    dictionaryEntry: Dictionary;
    i: number;
    prevInterpreter: Context["interpreter"];
  }[];
  inputStream: string;
  paused: boolean;
  halted: boolean;
  inputStreamPointer: number;
  interpreter: "queryWord" | "compileWord" | "executeColonDefinition";
  pop: () => Context["parameterStack"][0];
  push: (...args: Context["parameterStack"]) => void;
  peek: () => Context["parameterStack"][0];
  peekReturnStack: () => Context["returnStack"][0];
  advanceCurrentFrame: (value?: number) => void;
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
    // Unlike Jonesforth, when executing a word, we put all the relevant
    // current information at the top of the stack. In Jonesforth, there's only
    // one relevant piece of information, but we've got more.
    peekReturnStack() {
      const stackFrame = this.returnStack[this.returnStack.length - 1];
      if (!stackFrame) throw new Error("Return stack underflow");
      return stackFrame;
    },
    advanceCurrentFrame(value = 1) {
      const stackFrame = this.peekReturnStack();
      stackFrame.i += value;
    },
  };
};

function define({ name, impl, immediateImpl }: Omit<Dictionary, "prev">) {
  // TODO: Right now, there's only one global dictionary which is shared
  //       across all contexts. Considering how this might be isolated to
  //       a context object. Seems wasteful to copy "core" functions like those
  //       defined in JavaScript below across many dictionaries.
  const prev = latest;
  // @ts-ignore debug info
  if (impl) impl.__debug__originalWord = name;
  // @ts-ignore debug info
  if (immediateImpl) immediateImpl.__debug__originalWord = name;
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
    // Move cursor past the single blank space between
    ctx.inputStreamPointer++;
    const text = consume({ until: "'", including: true, ctx });
    ctx.push(text);
  },
  immediateImpl: ({ ctx }) => {
    // Move cursor past the single blank space between
    ctx.inputStreamPointer++;
    const text = consume({ until: "'", including: true, ctx });
    latest!.compiledWordImpls!.push(findDictionaryEntry({ word: "lit" })!.impl);
    latest!.compiledWordImpls!.push(text);
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
        ctx.returnStack.push({
          dictionaryEntry: dictionaryEntry!,
          i: 0,
          prevInterpreter: ctx.interpreter,
        });
        ctx.interpreter = "executeColonDefinition";
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
    const impl: Dictionary["impl"] = ({ ctx }) => {
      const { prevInterpreter } = ctx.returnStack.pop()!;
      ctx.interpreter = prevInterpreter;
    };

    // @ts-ignore debug info
    if (impl) impl.__debug__originalWord = "exit";
    latest!.compiledWordImpls!.push(impl);

    // TODO: If this is always the case, then `:` should throw an error if
    //       run from outside queryWord mode (i.e. can't define a word inside
    //       another word definition), right? Need to look at Jonesforth
    ctx.interpreter = "queryWord";
  },
});

define({
  name: "postpone",
  immediateImpl: ({ ctx }) => {
    const word = consume({ until: /\s/, ignoreLeadingWhitespace: true, ctx });
    const dictionaryEntry = findDictionaryEntry({ word });
    if (!dictionaryEntry) {
      throw new Error(`Couldn't find dictionary entry to POSTPONE ('${word}')`);
    }
    // TODO: This replicates a lot of the logic structure from compileWord,
    //       except it compiles the "compile time" semantics, i.e. it never
    //       executes immediate words, just compiles them, and for non-immediate
    //       words, it compiles in a function which compiles them.
    //       This seems right a la https://forth-standard.org/standard/core/POSTPONE
    if (dictionaryEntry.immediateImpl) {
      latest!.compiledWordImpls!.push(dictionaryEntry.immediateImpl);
    } else if (dictionaryEntry.isImmediate) {
      latest!.compiledWordImpls!.push(dictionaryEntry.impl);
    } else {
      latest!.compiledWordImpls!.push(() => {
        latest!.compiledWordImpls!.push(dictionaryEntry.impl);
      });
    }
  },
});

define({
  name: "immediate",
  immediateImpl: () => {
    latest!.isImmediate = true;
  },
  impl: () => {
    latest!.isImmediate = true;
  },
});

define({
  name: ",",
  impl: ({ ctx }) => {
    latest?.compiledWordImpls!.push(ctx.pop());
  },
});

// TODO: Standard Forth has a useful and particular meaning for `'`, aka `tick`,
//       which is to
//       push a pointer to the dictionary definiton (or CFA?) of the next word
//       onto the stack.
//       Problem I'm having is that I have too many quotation delimeters in use.
//       I like writing my HTML in MDX, and backtick `\`` has a special meaning
//       in Markdown. Also, I want to write code in this language in HTML attributes,
//       which are normally delimeted by double quotes. So all three normal string
//       quotation methods are already in use. One by MDX, one by Forth, and one
//       by HTML. Hmmm. I could write strings in parentheses or curly braces or
//       percent signs. I'm not sure what to do.
define({
  name: "tick",
  // TODO: This will only work in a word flagged `immediate`
  //       non-immediate impl should be possible via WORD, FIND, and >CFA according to Jonesforth
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const compiled = dictionaryEntry?.compiledWordImpls![i];

    if (!compiled || typeof compiled !== "function")
      throw new Error("tick must be followed by a word");

    ctx.push(compiled);

    ctx.advanceCurrentFrame();
  },
});

define({
  name: "lit",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const literal = dictionaryEntry?.compiledWordImpls![i];

    ctx.push(literal);

    ctx.advanceCurrentFrame();
  },
});

define({
  name: "here",
  impl: ({ ctx }) => {
    const dictionaryEntry = latest;
    const i = dictionaryEntry?.compiledWordImpls?.length || 0;
    ctx.push({
      dictionaryEntry,
      i,
      getter: () => dictionaryEntry!.compiledWordImpls![i],
      setter: (_value: unknown) =>
        (dictionaryEntry!.compiledWordImpls![i] = _value),
    });
  },
});

define({
  name: "-stackFrame",
  impl: ({ ctx }) => {
    const b = ctx.pop();
    const a = ctx.pop();

    // TODO: All this mess is just to assert that the parameters are the correct
    //       kind of objects for Typescript. Maybe this is what typeguard functions
    //       are for? Still, it's a sign that the idea of typescript with the mix
    //       of structured data and unknown data on the parameter stack is tenuous
    if (
      !a ||
      typeof a !== "object" ||
      !("dictionaryEntry" in a) ||
      !("i" in a) ||
      typeof a.i !== "number" ||
      !b ||
      typeof b !== "object" ||
      !("dictionaryEntry" in b) ||
      !("i" in b) ||
      typeof b.i !== "number"
    ) {
      throw new Error("`-stackFrame` requires two stackFrame parameters");
    }
    if (a.dictionaryEntry !== b.dictionaryEntry) {
      throw new Error(
        "`-stackFrame` across different dictionary entries not supported",
      );
    }
    ctx.push(a.i - b.i);
  },
});
define({
  name: "branch",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const value = dictionaryEntry.compiledWordImpls![i];

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("`branch` must be followed by a number");
    }

    ctx.advanceCurrentFrame(value);
  },
});

define({
  name: "0branch",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const condition = ctx.pop();
    const value = dictionaryEntry.compiledWordImpls![i];

    if (typeof condition !== "number" || Number.isNaN(condition)) {
      throw new Error(
        `\`0branch\` found a non-number on the stack (${condition}) which indicates an error. If you want to use arbitrary values, try falsyBranch instead.`,
      );
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("`0branch` must be followed by a number");
    }

    if (condition === 0) {
      ctx.advanceCurrentFrame(value);
    } else {
      ctx.advanceCurrentFrame();
    }
  },
});

define({
  name: "falsyBranch",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const condition = ctx.pop();
    const value = dictionaryEntry.compiledWordImpls![i];

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("`0branch` must be followed by a number");
    }

    if (!condition) {
      ctx.advanceCurrentFrame(value);
    } else {
      ctx.advanceCurrentFrame();
    }
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
    console.log(
      `Here is the input stream, with \`<--!-->\` marking the input stream pointer`,
    );
    console.log(
      `${ctx.inputStream.slice(
        0,
        ctx.inputStreamPointer,
      )}<--!-->${ctx.inputStream.slice(ctx.inputStreamPointer)}`,
    );
    debugger;
  },
});

define({
  name: "'debugger",
  immediateImpl: ({ ctx }) => {
    console.log("Interpreter immediately paused with context:", ctx);
    console.log(
      `Here is the input stream, with \`<--!-->\` marking the input stream pointer`,
    );
    console.log(
      `${ctx.inputStream.slice(
        0,
        ctx.inputStreamPointer,
      )}<--!-->${ctx.inputStream.slice(ctx.inputStreamPointer)}`,
    );
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
    } else if (dictionaryEntry.isImmediate) {
      if (typeof dictionaryEntry.impl !== "function")
        throw new Error("immediate word requires impl");
      if (typeof dictionaryEntry.immediateImpl === "function")
        throw new Error(
          "I got confused because a word had the immediate flag set and it had an immediateImpl",
        );
      dictionaryEntry.impl({ ctx });
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
  const { dictionaryEntry, i } = ctx.peekReturnStack();
  ctx.advanceCurrentFrame();
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

// Words written in the language!
query({
  ctx: {
    ...newCtx(),
    inputStream: `
  : ahead           here 0 , ;
  : <back           here -stackFrame , ;
  : if              postpone falsyBranch ahead ;                immediate
  : endif           here over -stackFrame swap ! ;              immediate
  : else            postpone branch ahead swap postpone endif ; immediate
  : begin           here ;                                      immediate
  : until           postpone falsyBranch <back ;                immediate
 `,
  },
});
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

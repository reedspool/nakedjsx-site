// Project page local ../posts/project-concatenative-javascript.mdx
// Github
// https://github.com/reedspool/reeds-website/blob/main/posts/project-concatenative-javascript.mdx
// Live reeds.website/project-concatenative-javascript
/**
 * In Forth, the dictionary is a linear structure (because everything's linear
 * in computer memory). But in JavaScript we have the benefit and the challenge
 * of references to data in unknowable places. That is, we can't refer directly
 * to memory, but instead we get named slots. Translating the wisdom and
 * pragmatism of Forth to the Wild West of JavaScript is the fun and curse of
 * this endeavor.
 */
type Dictionary = {
  name: string;
  previous: Dictionary | null;
  impl?: ({ ctx }: { ctx: Context }) => void;
  compiled?: (Dictionary["impl"] | unknown)[];
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
  compilationTarget: Dictionary | null;
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
    compilationTarget: null,
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

function define({
  name,
  impl,
  isImmediate = false,
}: Omit<Dictionary, "previous">) {
  // TODO: Right now, there's only one global dictionary which is shared
  //       across all contexts. Considering how this might be isolated to
  //       a context object. Seems wasteful to copy "core" functions like those
  //       defined in JavaScript below across many dictionaries.
  //       Maybe each dictionary could have its own dictionary which it searches
  //       first? Then I'd have to distinguish between which dictionary to apply
  //       a new word definition - doesn't seem to bad though.
  // @ts-ignore debug info
  if (impl) impl.__debug__originalWord = name;
  latest = { previous: latest, name, impl, isImmediate };
}

define({
  name: "swap",
  impl: ({ ctx }) => {
    const [a, b] = [ctx.pop(), ctx.pop()];
    ctx.push(a, b);
  },
});
define({
  name: "over",
  impl: ({ ctx }) => {
    const [a, b] = [ctx.pop(), ctx.pop()];
    ctx.push(b, a, b);
  },
});

define({
  name: "rot",
  impl: ({ ctx }) => {
    const [a, b, c] = [ctx.pop(), ctx.pop(), ctx.pop()];
    ctx.push(b, a, c);
  },
});

define({
  name: "-rot",
  impl: ({ ctx }) => {
    const [a, b, c] = [ctx.pop(), ctx.pop(), ctx.pop()];
    ctx.push(a, c, b);
  },
});
define({
  name: "dup",
  impl: ({ ctx }) => ctx.push(ctx.peek()),
});
define({
  name: "drop",
  impl: ({ ctx }) => ctx.pop(),
});
define({
  name: "me",
  impl: ({ ctx }) => ctx.push(ctx.me),
});
define({
  name: "'",
  isImmediate: true,
  impl: ({ ctx }) => {
    // TODO: Switching on the state of the interpreter feels dirty, coupling the
    //       implementation of this word to the implementation of the compiler,
    //       which is at higher level of abstraction. However, that's exactly
    //       how Jonesforth does it (though in Forth itself).
    //       I'd still like to find a better way.
    if (ctx.interpreter === "compileWord") {
      // Move cursor past the single blank space between
      ctx.inputStreamPointer++;
      const text = consume({ until: "'", including: true, ctx });
      ctx.compilationTarget!.compiled!.push(
        findDictionaryEntry({ word: "lit" })!.impl,
      );
      ctx.compilationTarget!.compiled!.push(text);
    } else {
      // Move cursor past the single blank space between
      ctx.inputStreamPointer++;
      const text = consume({ until: "'", including: true, ctx });
      ctx.push(text);
    }
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
    const [b, a] = [ctx.pop(), ctx.pop()];
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
      const [b, a] = [ctx.pop(), ctx.pop()];
      ctx.push(binary(a, b));
    },
  });
}

defineBinaryExactlyAsInJS({ name: "&&" });
defineBinaryExactlyAsInJS({ name: "||" });
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
    let dictionaryEntry: Dictionary | null;

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
    // `define` will set `latest` to the new word, and that's the word we need
    // to execute later.
    dictionaryEntry = latest;
    dictionaryEntry!.compiled = [];
    ctx.interpreter = "compileWord";

    // In most Forth's, compilation occurs directly into `latest`. But here
    // we enable compililation into entries which don't end up in the main
    // dictionary. See the definiton of "on" in the web section for an example.
    ctx.compilationTarget = dictionaryEntry;
  },
});

define({
  name: "exit",
  impl: ({ ctx }) => {
    const { prevInterpreter } = ctx.returnStack.pop()!;
    ctx.interpreter = prevInterpreter;
  },
});

define({
  name: ";",
  isImmediate: true,
  impl: ({ ctx }) => {
    ctx.compilationTarget!.compiled!.push(
      findDictionaryEntry({ word: "exit" })!.impl,
    );

    // TODO: If this is always the case, then `:` should throw an error if
    //       run from outside queryWord mode (i.e. can't define a word inside
    //       another word definition), right? Need to look at Jonesforth
    ctx.interpreter = "queryWord";
    ctx.compilationTarget = null;
  },
});

define({
  name: "postpone",
  isImmediate: true,
  impl: ({ ctx }) => {
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
    if (dictionaryEntry.isImmediate) {
      ctx.compilationTarget!.compiled!.push(dictionaryEntry.impl);
    } else {
      const impl: Dictionary["impl"] = ({ ctx }) => {
        ctx.compilationTarget!.compiled!.push(dictionaryEntry.impl);
      };
      ctx.compilationTarget!.compiled!.push(impl);
    }
  },
});

define({
  name: "immediate",
  isImmediate: true,
  impl: ({ ctx }) => {
    // When `immediate` occurs within a definition, it can occur in a word which
    // will not end up in the dictionary (i.e. not overwrite `latest`),
    // e.g. `: x immediate ... ;` but if it occurs outside the definition e.g.
    // `: x ... ; immediate` that will only work to adjust `latest`
    const target = ctx.compilationTarget ?? latest;
    target!.isImmediate = true;
  },
});

define({
  name: ",",
  impl: ({ ctx }) => ctx.compilationTarget?.compiled!.push(ctx.pop()),
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

    const compiled = dictionaryEntry?.compiled![i];

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

    const literal = dictionaryEntry?.compiled![i];

    ctx.push(literal);

    ctx.advanceCurrentFrame();
  },
});

define({
  name: "here",
  impl: ({ ctx }) => {
    const dictionaryEntry = ctx.compilationTarget;
    const i = dictionaryEntry?.compiled?.length || 0;
    // This shape merges the "return stack frame" and the "variable" types to
    // refer to a location within a dictionary entry's "compiled" data. In Forth,
    // this is much simpler since can point anywhere in linear memory!
    ctx.push({
      dictionaryEntry,
      i,
      getter: () => dictionaryEntry!.compiled![i],
      setter: (_value: unknown) => (dictionaryEntry!.compiled![i] = _value),
    });
  },
});

define({
  name: "-stackFrame",
  impl: ({ ctx }) => {
    const [b, a] = [ctx.pop(), ctx.pop()];

    // TODO: All this mess is just to assert that the parameters are the correct
    //       kind of objects so Typescript doesn't complain when I access the
    //       properties below. Maybe this is what typeguard functions are for?
    //       Even so, it's a sign that the idea of typescript with the mix of
    //       structured data and unknown data on the parameter stack is tenuous
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

    // Maybe there is a meaning for subtracting locations within different
    // dictionary entries, but I haven't thought of it
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

    const value = dictionaryEntry.compiled![i];

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
    const value = dictionaryEntry.compiled![i];

    if (typeof condition !== "number" || Number.isNaN(condition)) {
      throw new Error(
        `\`0branch\` found a non-number on the stack (${condition}) which indicates an error. If you want to use arbitrary values, try falsyBranch instead.`,
      );
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("`0branch` must be followed by a number");
    }

    // Must at least advance beyond the next location where the distance sits
    ctx.advanceCurrentFrame(condition === 0 ? value : 1);
  },
});

define({
  name: "falsyBranch",
  impl: ({ ctx }) => {
    const { dictionaryEntry, i } = ctx.peekReturnStack();

    const condition = ctx.pop();
    const value = dictionaryEntry.compiled![i];

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("`falsyBranch` must be followed by a number");
    }

    // Must at least advance beyond the next location where the distance sits
    ctx.advanceCurrentFrame(!condition ? value : 1);
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
    const millis = ctx.pop() as number;
    // Pause execution and restart it after the number of milliseconds.
    ctx.paused = true;
    setTimeout(() => {
      ctx.paused = false;
      query({ ctx });
    }, millis);
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
  isImmediate: true,
  impl: ({ ctx }) => {
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
    entry = entry.previous;
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
    if (dictionaryEntry.isImmediate) {
      if (typeof dictionaryEntry.impl !== "function")
        throw new Error("immediate word requires impl");
      dictionaryEntry.impl({ ctx });
    } else {
      ctx.compilationTarget!.compiled!.push(dictionaryEntry.impl);
    }
  } else {
    const primitiveMaybe = wordAsPrimitive({ word });

    if (primitiveMaybe.isPrimitive) {
      ctx.compilationTarget!.compiled!.push(
        findDictionaryEntry({ word: "lit" })!.impl,
      );
      ctx.compilationTarget!.compiled!.push(primitiveMaybe.value);
    } else {
      throw new Error(`Couldn't comprehend word '${word}'`);
    }
  }
}

function executeColonDefinition({ ctx }: { ctx: Context }) {
  const { dictionaryEntry, i } = ctx.peekReturnStack();
  ctx.advanceCurrentFrame();
  // If someone leaves off a `;`, e.g. `on click 1`, just exit normally
  if (i === dictionaryEntry!.compiled!.length) {
    findDictionaryEntry({ word: "exit" })!.impl!({ ctx });
    return;
  }
  const callable = dictionaryEntry!.compiled![i]!;
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

    // Input only had whitespace, will halt on the next call to `execute`.
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
  : again           postpone branch <back ;                     immediate
  : repeat          postpone again postpone endif ;             immediate
 `,
  },
});

/**
 * JavaScript stuff
 */
// Get the first item in an array
define({
  name: "first",
  impl: ({ ctx }) => {
    const array = ctx.pop()! as Array<unknown>;
    ctx.push(array[0]);
  },
});

// Index into an array
define({
  name: "nth",
  impl: ({ ctx }) => {
    const n = ctx.pop() as number;
    const array = ctx.pop()! as Array<unknown>;
    ctx.push(array[n]);
  },
});
/**
 * Web/browser specific things
 */
// Put the text (second in the parameter stack) into the innerText of the element
// (first in the parameter stack)
define({
  name: ">text",
  impl: ({ ctx }) => {
    const [element, content] = [ctx.pop(), ctx.pop()];
    // TODO: I put this here because I ran into this error where
    //       `select` returns a NodeList, not a single element.
    //       Considering a toggle DEBUG_MODE which does extensive
    //       checks like this everywhere, which can be turned off for speed.
    if (!(element instanceof HTMLElement))
      throw new Error("Require an Element to set innerText");
    (element as HTMLElement).innerText = content!.toString();
  },
});

// Get the element's text
define({
  name: "text>",
  impl: ({ ctx }) => {
    const element = ctx.pop();
    ctx.push((element as HTMLElement).innerText);
  },
});

// Add a class to an element
define({
  name: "addClass",
  impl: ({ ctx }) => {
    const [element, clazz] = [ctx.pop(), ctx.pop()];
    (element as HTMLElement).classList.add(clazz!.toString());
  },
});
define({
  name: "removeClass",
  impl: ({ ctx }) => {
    const [element, clazz] = [ctx.pop(), ctx.pop()];
    (element as HTMLElement).classList.remove(clazz!.toString());
  },
});
define({
  name: "toggleClass",
  impl: ({ ctx }) => {
    const [element, clazz] = [ctx.pop(), ctx.pop()];
    (element as HTMLElement).classList.toggle(clazz!.toString());
  },
});

// Use querySelectorAll to push a NodeList onto the stack
// Note: Use `first` to unpack the first element if you only want one
// Usage: `' span' me select`
define({
  name: "select",
  impl: ({ ctx }) => {
    const [element, selector] = [ctx.pop(), ctx.pop()];
    ctx.push((element as Element).querySelectorAll(selector!.toString()));
  },
});

// Like `select`, but slightly more convenient syntax
// Usage `me select' span'`
define({
  name: "select'",
  isImmediate: true,
  impl: ({ ctx }) => {
    // TODO: See note in definition of "'" about the state of the interpreter
    if (ctx.interpreter === "compileWord") {
      // Move cursor past the single blank space between
      ctx.inputStreamPointer++;
      const selector = consume({ until: "'", including: true, ctx });
      ctx.compilationTarget!.compiled!.push(
        findDictionaryEntry({ word: "lit" })!.impl,
      );
      ctx.compilationTarget!.compiled!.push(selector);
      ctx.compilationTarget!.compiled!.push(
        findDictionaryEntry({ word: "swap" })!.impl,
      );
      ctx.compilationTarget!.compiled!.push(
        findDictionaryEntry({ word: "select" })!.impl,
      );
    } else {
      const element = ctx.pop();
      // Move cursor past the single blank space between
      ctx.inputStreamPointer++;
      const selector = consume({ until: "'", including: true, ctx });
      ctx.push(selector);
      ctx.push(element);
      findDictionaryEntry({ word: "select" })!.impl!({ ctx });
    }
  },
});

// Add an event listener, like Hyperscript does. Works by defining an anonymous
// dictionary entry.
// Usage: `<a c="on click ' It worked!' me >text ;">`
define({
  name: "on",
  impl: ({ ctx }) => {
    const event = consume({ until: /\s/, ignoreLeadingWhitespace: true, ctx });
    // By not using `define` we don't adjust the dictionary pointer `latest`.
    // This is a divergence from Forth implementations I've seen, and I'm calling
    // it an "anonymous dictionary entry".
    const dictionaryEntry: Dictionary = {
      name: `anonymous-on-${event}-handler`,
      previous: null,
      compiled: [],
    };

    (ctx.me as Element).addEventListener(event, ({ target }) => {
      // When the event occurs, we will run an independent interpreter (new ctx)
      // with this anonymous dictionary entry already on the return stack. This
      // is almost exactly as if this were a colon definition named `x` and then
      // ran a program where `x` was the only word in the input stream.
      query({
        ctx: {
          ...newCtx(),
          me: target,
          returnStack: [
            {
              dictionaryEntry,
              i: 0,
              prevInterpreter: "queryWord", // Unused, I believe
            },
          ],
          interpreter: "executeColonDefinition",
        },
      });
    });

    ctx.interpreter = "compileWord";
    // Compile all words into this anonymous entry until `;`
    ctx.compilationTarget = dictionaryEntry;
  },
});

// Stolen with love from Hyperscript https://hyperscript.org and converted to TS
var scanForwardQuery = function (
  start: Node,
  root: Element | Document,
  match: string,
  wrap?: boolean,
): Element | undefined {
  var results = root.querySelectorAll(match);
  for (var i = 0; i < results.length; i++) {
    var elt = results[i];
    if (!elt) return;
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_PRECEDING
    ) {
      return elt;
    }
  }
  if (wrap) {
    return results[0];
  }

  return;
};

var scanBackwardsQuery = function (
  start: Node,
  root: Element | Document,
  match: string,
  wrap?: boolean,
): Element | undefined {
  var results = root.querySelectorAll(match);
  for (var i = results.length - 1; i >= 0; i--) {
    var elt = results[i];
    if (!elt) return;
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return elt;
    }
  }
  if (wrap) {
    return results[results.length - 1];
  }

  return;
};

var scanForwardArray = function (
  start: unknown,
  array: Array<Element>,
  match: Parameters<typeof HTMLElement.prototype.matches>[0],
  wrap?: Boolean,
): Element | undefined {
  var matches: Array<Element> = [];
  array.forEach(function (elt) {
    if (elt.matches(match) || elt === start) {
      matches.push(elt);
    }
  });
  for (var i = 0; i < matches.length - 1; i++) {
    var elt = matches[i];
    if (elt === start) {
      return matches[i + 1];
    }
  }
  if (wrap) {
    var first = matches[0];
    if (first && first.matches(match)) {
      return first;
    }
  }

  return;
};

var scanBackwardsArray = function (
  start: unknown,
  array: Array<Element>,
  match: Parameters<typeof HTMLElement.prototype.matches>[0],
  wrap?: Boolean,
): Element | undefined {
  return scanForwardArray(start, Array.from(array).reverse(), match, wrap);
};

define({
  name: "next",
  impl: ({ ctx }) => {
    const [element, selector] = [ctx.pop(), ctx.pop()];

    const result = scanForwardQuery(
      element as Element,
      document,
      selector!.toString(),
    );
    ctx.push(result);
  },
});

define({
  name: "previous",
  impl: ({ ctx }) => {
    const [element, selector] = [ctx.pop(), ctx.pop()];

    const result = scanBackwardsQuery(
      element as Element,
      document,
      selector!.toString(),
    );
    ctx.push(result);
  },
});

// Find the closest parent element which matches the selector
define({
  name: "closest",
  impl: ({ ctx }) => {
    const [selector, element] = [ctx.pop() as string, ctx.pop() as Element];
    const result = element.parentElement!.closest(selector);
    ctx.push(result);
  },
});

// Emit the named event
// Usage: `me ' click' emit`
define({
  name: "emit",
  impl: ({ ctx }) => {
    const [event, element] = [ctx.pop() as string, ctx.pop() as Element];
    element.dispatchEvent(
      new CustomEvent(event, {
        bubbles: true,
        cancelable: true,
      }),
    );
  },
});

// For any HTML element on the page with a `c` attribute, execute the value of
// that attribute. This intentionally emulates Hyperscript's `_` or `data-script`
// attributes.
function runAttributes() {
  document.querySelectorAll("[c]").forEach((el) => {
    const inputStream = el.getAttribute("c")!;
    const ctx = { ...newCtx(), me: el, inputStream };
    try {
      query({
        ctx,
      });
    } catch (error) {
      console.error(`Error in script:\n\n"${inputStream}"`);
      console.error(error);
      console.error("Context after error", ctx);
      console.error(
        `Here is the input stream, with \`<--!-->\` marking the input stream pointer`,
      );
      console.error(
        `${ctx.inputStream.slice(
          0,
          ctx.inputStreamPointer,
        )}<--!-->${ctx.inputStream.slice(ctx.inputStreamPointer)}`,
      );
    }
  });
}

window.addEventListener("DOMContentLoaded", runAttributes);
window.catscript = {
  runAttributes,
  query,
  newCtx,
  define,
};

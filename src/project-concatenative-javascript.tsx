// Project page local ../posts/project-concatenative-javascript.mdx
// Github
// https://github.com/reedspool/reeds-website/blob/main/posts/project-concatenative-javascript.mdx
// Live reeds.website/project-concatenative-javascript
type Dictionary = {
  name: string;
  prev: Dictionary | null;
  impl?: ({ ctx }: { ctx: Context }) => void;
  immediateImpl?: ({ ctx }: { ctx: Context }) => void;
  compiledWordImpls?: Dictionary["impl"][];
};
let dictionary: Dictionary | null = null;
let compilingMode = false;
type Context = typeof ctx;
const ctx = {
  parameterStack: [] as unknown[],
  inputStream: "",
  inputStreamPointer: 0,
  pop: () => ctx.parameterStack.pop(),
  peek: () => ctx.parameterStack[ctx.parameterStack.length - 1],
  push: (...args: unknown[]) => ctx.parameterStack.push(...args),
  me: null as Element | unknown,
};

function define({ name, impl, immediateImpl }: Omit<Dictionary, "prev">) {
  const prev = dictionary;
  dictionary = { prev, name, impl, immediateImpl };
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
    const c = ctx.pop();
    const b = ctx.pop();
    const a = ctx.pop();
    ctx.push(b);
    ctx.push(c);
    ctx.push(a);
  },
});
define({ name: "dup", impl: ({ ctx }) => ctx.push(ctx.peek()) });
define({ name: "drop", impl: ({ ctx }) => ctx.pop() });
define({ name: "me", impl: ({ ctx }) => ctx.push(ctx.me) });
define({
  name: "'",
  impl: ({ ctx }) => {
    // Move cursor past the blank space between
    ctx.inputStreamPointer++;
    const text = consume({ until: "'", including: true });
    ctx.push(text);
  },
  immediateImpl: ({ ctx }) => {
    const text = consume({ until: "'", including: true });

    dictionary!.compiledWordImpls!.push(() => ctx.push(text));
  },
});
define({
  name: ">text",
  impl: ({ ctx }) =>
    ((ctx.pop() as HTMLElement).innerText = ctx.pop()!.toString()),
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

define({
  name: ":",
  impl: () => {
    let dictionaryEntry: typeof dictionary;

    // Consume any beginning whitespace
    consume({ until: /\S/ });
    const name = consume({ until: /\s/ });
    // TODO: How will we continue to call each after calling the first one? Need to implement the return stack
    define({
      name,
      impl: ({ ctx }) => {
        dictionaryEntry!.compiledWordImpls![0]!({ ctx });
      },
    });
    dictionaryEntry = dictionary;
    dictionaryEntry!.compiledWordImpls = [];
    compilingMode = true;
  },
});

define({
  name: ";",
  immediateImpl: () => {
    compilingMode = false;
  },
});

define({
  name: "variable",
  impl: () => {
    // Consume any beginning whitespace
    consume({ until: /\S/ });
    const name = consume({ until: /\s/ });
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

function findDictionaryEntry({ word }: { word: Dictionary["name"] }) {
  let entry = dictionary;

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

function execute({ word }: { word: Dictionary["name"] }) {
  const dictionaryEntry = findDictionaryEntry({ word });

  if (dictionaryEntry) {
    if (compilingMode) {
      if (dictionaryEntry.immediateImpl) {
        dictionaryEntry.immediateImpl({ ctx });
      } else {
        dictionary!.compiledWordImpls!.push(dictionaryEntry.impl);
      }
    } else {
      dictionaryEntry!.impl!({ ctx });
    }
  } else {
    const primitiveMaybe = wordAsPrimitive({ word });

    if (primitiveMaybe.isPrimitive) {
      if (compilingMode) {
        dictionary!.compiledWordImpls!.push(() =>
          ctx.push(primitiveMaybe.value),
        );
      } else {
        ctx.push(primitiveMaybe.value);
      }
    } else {
      throw new Error(`Couldn't comprehend word '${word}'`);
    }
  }
}

function consume({
  until,
  including,
}: {
  until: RegExp | string;
  including?: boolean;
}) {
  let value = "";
  while (ctx.inputStreamPointer < ctx.inputStream.length) {
    const char = ctx.inputStream[ctx.inputStreamPointer];
    if (!char) throw new Error("Input stream overflow");
    if (typeof until === "string" && char === until) break;
    if (typeof until !== "string" && until.test(char)) break;
    ctx.inputStreamPointer++;
    value += char;
  }
  if (including) ctx.inputStreamPointer++;
  return value;
}

function query({ input, me }: { input: string; me: Element }) {
  ctx.me = me;
  ctx.inputStream += input;

  while (ctx.inputStreamPointer < ctx.inputStream.length) {
    // Consume any beginning whitespace
    consume({ until: /\S/ });

    // Input only had whitespace
    if (ctx.inputStreamPointer >= ctx.inputStream.length) return;

    const word = consume({ until: /\s/ });

    if (word.length > 0) {
      execute({ word });
    }
  }
}

document
  .querySelectorAll("[c]")
  .forEach((el: Element) => query({ input: el.getAttribute("c")!, me: el }));

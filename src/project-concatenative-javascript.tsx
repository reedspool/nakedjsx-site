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

function addDictionaryWord({
  name,
  impl,
  immediateImpl,
}: Omit<Dictionary, "prev">) {
  const prev = dictionary;
  dictionary = { prev, name, impl, immediateImpl };
}

addDictionaryWord({
  name: "swap",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    ctx.push(a);
    ctx.push(b);
  },
});
addDictionaryWord({
  name: "over",
  impl: ({ ctx }) => {
    const a = ctx.pop();
    const b = ctx.pop();
    ctx.push(b);
    ctx.push(a);
    ctx.push(b);
  },
});

addDictionaryWord({
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
addDictionaryWord({ name: "dup", impl: ({ ctx }) => ctx.push(ctx.peek()) });
addDictionaryWord({ name: "drop", impl: ({ ctx }) => ctx.pop() });
addDictionaryWord({ name: "me", impl: ({ ctx }) => ctx.push(ctx.me) });
addDictionaryWord({
  name: "'",
  impl: ({ ctx }) => {
    ctx.push(consume({ until: "'", including: true }));
  },
  immediateImpl: ({ ctx }) => {
    const text = consume({ until: "'", including: true });

    dictionary!.compiledWordImpls!.push(() => ctx.push(text));
  },
});
addDictionaryWord({
  name: ">text",
  impl: ({ ctx }) =>
    ((ctx.pop() as HTMLElement).innerText = ctx.pop()!.toString()),
});
addDictionaryWord({
  name: "&&",
  impl: ({ ctx }) => {
    const b = ctx.pop();
    const a = ctx.pop();
    ctx.push(a && b);
  },
});

addDictionaryWord({
  name: ":",
  impl: () => {
    let dictionaryEntry: typeof dictionary;

    // Consume any beginning whitespace
    consume({ until: /\S/ });
    const name = consume({ until: /\s/ });
    // TODO: How will we continue to call each after calling the first one? Need to implement the return stack
    console.log("Name:", `'${name}'`);
    addDictionaryWord({
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

addDictionaryWord({
  name: ";",
  immediateImpl: () => {
    compilingMode = false;
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

// List from https://developer.mozilla.org/en-US/docs/Glossary/Void_element
export const VoidElementTagNames = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

// Starting types derived by guessing from looking at React documentation
// https://react.dev/reference/react/createElement#createelement
export const MyJSXFactory = (
  type: keyof JSX.IntrinsicElements | Function,
  props: Record<string, any> | null,
  ...children: any[]
): string => {
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  if (typeof type !== "string") {
    throw Error(
      `JSX Factory called with unknown 'type' of type "${typeof type}"`,
    );
  }

  if (type.match(/^[^a-z]/)) {
    throw Error(`Expected tagName for type, but got "${type}"`);
  }

  let attributes = "";

  if (props !== null) {
    attributes =
      " " +
      Object.entries(props)
        .map(([name, value]) => {
          // For boolean attributes, just the name, not `name="true"`
          if (typeof value === "boolean") return value ? name : "";
          return `${name}="${value.toString()}"`;
        })
        .join(" ");
  }

  let childrenHtml = "";

  if (Array.isArray(children)) {
    childrenHtml = children
      // I think we get a deeply nested array if we have a list of JSX elements
      // as children like
      // <div>
      //     Maybe text node too
      //     {" and maybe this kinda node "}
      //     <i></i>
      //     <i></i>
      // </div>
      // Testing needed
      .flat(Infinity)
      .join("");

    if (type === "code") {
      childrenHtml = escapeHtml(childrenHtml);
    }

    if (VoidElementTagNames.includes(type) && childrenHtml.length > 0) {
      throw new Error(
        `Void element '${type}' cannot have children, ${childrenHtml}`,
      );
    }
  } else {
    throw new Error(`Unexpected type of children prop: '${typeof children}'`);
  }

  if (VoidElementTagNames.includes(type)) {
    return `<${type}${attributes}>`;
  }

  return `<${type}${attributes}>${childrenHtml}</${type}>`;
};

export const MyJSXFragmentFactory = ({
  children,
}: {
  children: any[];
}): string => children.flat(Infinity).join("");

// Stolen from NakedJSX https://github.com/NakedJSX/core
export const escapeHtml = (text: string) => {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => htmlEscapeMap[m] ?? "");
};

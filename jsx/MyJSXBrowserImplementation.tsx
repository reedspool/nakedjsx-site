import { escapeHtml, VoidElementTagNames } from "./MyJSXStringImplementation";

// Starting types derived by guessing from looking at React documentation
// https://react.dev/reference/react/createElement#createelement
export const MyJSXFactory = (
  type: keyof JSX.IntrinsicElements | Function,
  props: Record<string, any> | null,
  ...children: any[]
): Element => {
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

  const element = document.createElement(type);

  if (props !== null) {
    Object.entries(props).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  if (Array.isArray(children)) {
    if (
      VoidElementTagNames.includes(type) &&
      children.flat(Infinity).length > 0
    ) {
      throw new Error(
        `Void element '${type}' cannot have children, ${children
          .flat(Infinity)
          .join(", ")}`,
      );
    }
    children

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
      .forEach((child) => {
        if (type === "code") {
          if (typeof child !== "string")
            throw new Error(
              `Unexpected non-string child '${child}' inside a code block, unable to escape`,
            );
          child = escapeHtml(child);
        }

        element.append(child);
      });
  } else {
    throw new Error(`Unexpected type of children prop: '${typeof children}'`);
  }

  return element;
};

export const MyJSXFragmentFactory = ({
  children,
}: {
  children: any[];
}): any[] => children.flat(Infinity);

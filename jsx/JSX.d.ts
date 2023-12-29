declare namespace JSX {
  interface IntrinsicElements {
    [index: HTMLElement["tagName"] | SVGElement["tagName"]]: any;
  }

  interface Element {}
  interface ElementClass {}

  // Learned about this from https://dev.to/ferdaber/typescript-and-jsx-part-iii---typing-jsx-children-1aj
  interface ElementChildrenAttribute {
    // This key "children" in this specific interface in this specific namespace
    // is what causes the `children` prop to be typed properly, although
    // `esbuild` already uses the name `children` in its implementation of the
    // compiler
    children: {};
  }

  interface HTMLAttributes<T> {
    // Preact supports using "class" instead of "classname" - need to teach typescript
    class?: string;
  }
  type Children = Element | Element[] | string | string[] | null;
}

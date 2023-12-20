export const P = ({ children, ...props }: { children: JSX.Children }) => (
  <p {...props}>{children}</p>
);
export const Span = ({ children, ...props }: { children: JSX.Children }) => (
  <span {...props}>{children}</span>
);

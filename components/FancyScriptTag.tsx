/**
 * This code is all scrunched up because we don't want any unintentional newline
 * or spaces sneaking into the output
 */
export const FancyScriptTag = ({
  children,
  classes = "block",
}: {
  children: JSX.Children;
  classes?: string;
}) => (
  <>
    {`<pre><code>&lt;script&gt;<script class="${classes}" type="module">${
      typeof children == "string" ? children.trim() : children
    }</script>&lt;/script&gt;</code></pre>`}
  </>
);

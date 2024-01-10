/**
 * This code is all scrunched up because we don't want any unintentional newline
 * or spaces sneaking into the output
 */
export const FancyScriptTag = ({
  children,
  classes = "block",
  type = "module",
  defer = false,
  async = false,
}: {
  children: JSX.Children;
  classes?: string;
  type?: string;
  defer: boolean;
  async: boolean;
}) => (
  <>
    {`<pre><code>&lt;script&gt;<script class="${classes}" type="${type}" ${
      defer ? "defer" : ""
    } ${async ? "async" : ""}>${
      typeof children == "string" ? children.trim() : children
    }</script>&lt;/script&gt;</code></pre>`}
  </>
);

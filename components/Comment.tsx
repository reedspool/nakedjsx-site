import { P } from "./Elements";

export const Comment = ({
  children,
  Wrap = P,
}: {
  children: JSX.Children;
  Wrap: (...args: any[]) => JSX.Element;
}) => {
  return (
    <Wrap>
      [Author's comment: <span>{children}</span>]
    </Wrap>
  );
};

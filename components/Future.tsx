import { P } from "./Elements";

export const Future = ({
  children,
  Wrap = P,
}: {
  children: JSX.Children;
  Wrap: (...args: any[]) => JSX.Element;
}) => {
  return (
    <Wrap>
      Future: <span>{children}</span>
    </Wrap>
  );
};

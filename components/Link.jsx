import { GITHUB_URL } from "../src/constants.mjs";
import { readFile, writeFile } from "node:fs/promises";

console.log(`Running this script from CWD "${process.cwd()}"`);
console.log(`Attempting to parse JSON data in Link.json`);
const { slugsToHrefs, slugsToHashes } = JSON.parse(
  (await readFile("./components/Link.json")).toString()
);

export const Link = ({ slug, hash, children }) => {
  const href = slugsToHrefs[slug];
  if (!href) throw new Error(`No href found for slug "${slug}"`);
  if (hash && !slugsToHashes[slug].includes(hash))
    throw new Error(`Unrecorded hash "${hash}" for slug "${slug}"`);
  return <a href={href + (hash ? `#${hash}` : "")}>{children}</a>;
};

export const HashTarget = ({ id, children }) => {
  // In the future, I'd love to determine the name of the file this is within to
  // assert that the hash and the slug match up, but I have no clue how
  if (!Object.values(slugsToHashes).flat().includes(id))
    throw new Error(`Unused hash target "${id}"`);

  return <div id={id}>Anchor: {children}</div>;
};

export const GitHubDefaultContent = () => (
  <>
    GitHub <i className={`bx bxl-github align-middle ml-sm inline-block`} />
  </>
);

export const GitHubLink = ({ extraPath = "", text = "GitHub" }) => (
  <a href={GITHUB_URL + extraPath}>
    <ChildrenOrComponent Component={GitHubDefaultContent}>
      {text}
    </ChildrenOrComponent>
  </a>
);

// I expected this to work but it doesn't because children is a non-null, non-empty
// array even when we use the self-closing form `<GitHubLink />`. What could children possible be here? I think this is a naked-jsx bug but I confirmed it by testing in create-react-app or my old website.
export const GitHubLinkBroken = ({ extraPath = "", children }) => (
  <a href={GITHUB_URL + extraPath}>
    <ChildrenOrComponent Component={GitHubDefaultContent}>
      {children}
    </ChildrenOrComponent>
  </a>
);

export const ChildrenOrComponent = ({ children, Component }) => (
  <>
    {children ? (
      Array.isArray(children) ? (
        children.length > 0 ? (
          children
        ) : (
          <Component />
        )
      ) : (
        children
      )
    ) : (
      <Component />
    )}
  </>
);

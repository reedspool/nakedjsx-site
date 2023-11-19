import { GITHUB_URL } from "../src/constants.mjs";

export const slugsToHrefs = {
  home: "/",
  "project-improve-this-website": "project-improve-this-website.html",
  "projects-on-this-site": "project-track-my-projects.html",
  "about-project-logs": "topic-project-logs.html",
  "project-index": "topic-project-index.html",
  "project-add-popout": "project-add-popout.html",
  "project-write-script-and-style-tags":
    "project-write-script-and-style-tags.html",
  "project-precision-timer": "project-precision-timer.html",
  "project-add-rss": "project-add-rss.html",
  "rss-feed": "rss.xml",
  feed: "feed.html",
  "project-fizzbuzz-in-css": "project-fizzbuzz-in-css.html",
  "project-symbolic-differentiator": "project-symbolic-differentiator.html",
  "topic-operating-this-website": "topic-operating-this-website.html",
  "project-supabase-authentication": "project-supabase-authentication.html",
  "project-dnd-game-2023": "project-dnd-game-2023.html",
  "project-log-game": "project-log-game.html",
};

export const slugsToHashes = {
  "project-improve-this-website": ["exploring-client-side-js-in-nakedjsx"],
};
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

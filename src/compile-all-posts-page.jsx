import { writeFile } from "node:fs/promises";
import { Page } from "@nakedjsx/core/page";
import posts from "./generated-post-imports.mjs";
import { Link } from "../components/Link.jsx";
import { Future } from "../components/Future.jsx";
import { LogoSVG, LogoSVGSymbol } from "../components/LogoSVGSymbol.jsx";

import { Feed } from "feed";
import { OUT_DIR_REL_PATH } from "./constants.mjs";

const rssSiteImageUrl = "https://reeds.website/assets/circle_r.svg";

const feed = new Feed({
  title: "Reed's Website",
  description: "Updates and additions",
  id: "https://reeds.website/",
  link: "https://reeds.website/",
  language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  image: rssSiteImageUrl,
  favicon: "https://reeds.website/favicon.ico",
  copyright: "All rights reserved 2023, Reed Spool",
  // updated: new Date(2013, 6, 14), // optional, default = today
  generator: "awesome", // optional, default = 'Feed for Node.js'
  feedLinks: {
    rss2: `https://reeds.website/rss.xml`,
    json: `https://reeds.website/rss.json`,
    atom: `https://reeds.website/atom.xml`,
  },
  author: {
    name: "Reed's Website",
    email: "reedwith2es@gmail.com",
    link: "https://reeds.website/",
  },
});

for (const [{ inputFileName, outputFileName }, Post] of posts) {
  const url = `https//reeds.website/${outputFileName}`;
  feed.addItem({
    // Need to export these
    title: "Post title",
    description: "Post description",
    content: "Post content",
    date: new Date(),
    id: url,
    link: url,
    image: rssSiteImageUrl,
  });
  Page.Create("en");
  Page.AppendHead(<title>Reed's Website</title>);
  Page.AppendHead(
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  );
  Page.AppendHead(
    <link rel="preconnect" href="https://fonts.googleapis.com" />
  );
  Page.AppendHead(
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  );
  Page.AppendHead(
    <link
      href="https://fonts.googleapis.com/css2?family=Jost&family=Karla&display=swap"
      rel="stylesheet"
    />
  );
  Page.AppendHead(<link rel="stylesheet" href="./build.css" />);

  Page.AppendBody(
    <>
      <LogoSVGSymbol />
      {/*
                Wrap the header and the header AND main content in a growing
                container so that A) the sticky header never scrolls off the
                page (See https://stackoverflow.com/a/47352847) and B) the footer
                always remains squarely on the bottom of the page whether the
                content is shorter than the screen size or way longer. Depends on
                html and body having `height: 100%;` and body being flex-column.
              */}
      <div class="flex-grow">
        <header class="sticky">
          <div class=" flex flex-row gap-4 items-center font-flashy">
            <LogoSVG />
            <Link slug="home">Reed's Website</Link>
          </div>
        </header>
        <main class="cpnt-blog-article">
          <Post originFilename={inputFileName} components={{ Link, Future }} />
        </main>
      </div>
      <footer>
        <Link slug="home">Home</Link>
      </footer>
    </>
  );

  Page.Render(outputFileName);
}

// Must match `feedLinks` in the feed config
writeFile(`./build/rss.xml`, feed.rss2());
writeFile(`./build/rss.json`, feed.json1());
writeFile(`./build/atom.xml`, feed.atom1());

import { writeFile } from "node:fs/promises";
import { CommonNakedJSXPage } from "./CommonNakedJSXPage.jsx";
import { OUT_DIR_REL_PATH } from "./constants.mjs";
import { GenericPageBody } from "../components/GenericPageBody.jsx";

import { Feed } from "feed";
import { BASE_URL } from "./constants.mjs";

const image = `${BASE_URL}/assets/circle_r.svg`;
const filename = "feed.html";

/**
 * This file generates a single HTML page and all RSS feeds with similar content.
 */

const feed = new Feed({
  title: "Reed's Website",
  description: "Updates and additions",
  id: `${BASE_URL}/`,
  link: `${BASE_URL}/`,
  language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  image,
  favicon: `${BASE_URL}/favicon.ico`,
  copyright: "All rights reserved 2023, Reed Spool",
  // updated: new Date(2013, 6, 14), // optional, default = today
  generator: "awesome", // optional, default = 'Feed for Node.js'
  feedLinks: {
    rss2: `${BASE_URL}/rss.xml`,
    json: `${BASE_URL}/rss.json`,
    atom: `${BASE_URL}/atom.xml`,
  },
  author: {
    name: "Reed's Website",
    email: "reedwith2es@gmail.com",
    link: `${BASE_URL}/`,
  },
});
const url = `${BASE_URL}/${filename}`;
feed.addItem({
  // Need to export these
  title: "Post title",
  description: "Post description",
  content: "Post content",
  date: new Date("2023-09-16T07:00:00.000Z"),
  id: url,
  link: url,
  image,
});

feed.addItem({
  // Need to export these
  title: "Post title 2",
  description: "Post description",
  content: "Post content",
  date: new Date("2023-09-17T07:00:00.000Z"),
  id: url,
  link: url,
  image,
});

// Write out all RSS Feeds
// Must match `feedLinks` in the feed config
writeFile(`./build/rss.xml`, feed.rss2());
writeFile(`./build/rss.json`, feed.json1());
writeFile(`./build/atom.xml`, feed.atom1());

const feedItems = [...feed.items].sort(
  (a, b) => b.date.getTime() - a.date.getTime()
);

await CommonNakedJSXPage({
  outputFileName: `${OUT_DIR_REL_PATH}/${filename}`,
  Body: () => (
    <>
      <h1>Feed/Change Log</h1>

      <p>
        Welcome from my RSS feed! This page is in reverse chronological order.
        It is exactly the content of my RSS feed.
      </p>

      {feedItems.map(({ title, date }) => (
        <>
          <h2>{title}</h2>
          <h3>{date}</h3>
        </>
      ))}
    </>
  ),
});

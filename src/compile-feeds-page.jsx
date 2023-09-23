import { writeFile } from "node:fs/promises";
import { CommonNakedJSXPage } from "./CommonNakedJSXPage.jsx";
import { OUT_DIR_REL_PATH } from "./constants.mjs";
import { GenericPageBody } from "../components/GenericPageBody.jsx";
import { Link } from "../components/Link.jsx";

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
  id: `${BASE_URL}/${filename}`,
  link: `${BASE_URL}/${filename}`,
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
const itemDefaults = {
  id: url,
  link: url,
  image,
};

feed.addItem({
  ...itemDefaults,
  date: new Date("2023-09-16T07:00:00.000Z"),
  title: "Hello World",
  content: `
    Thank you for subscribing to my feed. I intend to add an entry to this feed
    arbitrarily and randomly as I work on this site.
  `,
});

feed.addItem({
  ...itemDefaults,
  date: new Date("2023-09-23T07:00:00.000Z"),
  title: "FizzBuzz in CSS",
  content: `
    I made FizzBuzz in CSS. Check it out at ${BASE_URL}/project-fizzbuzz-in-css
  `,
});

// Write out all RSS Feeds
// Must match `feedLinks` in the feed config
writeFile(`./build/rss.xml`, feed.rss2());
writeFile(`./build/rss.json`, feed.json1());
writeFile(`./build/atom.xml`, feed.atom1());

const feedItems = [...feed.items].sort((a, b) => b.date - a.date);

await CommonNakedJSXPage({
  outputFileName: `${OUT_DIR_REL_PATH}/${filename}`,
  Body: () => (
    <GenericPageBody>
      <h1>Updates</h1>

      <p>
        This is the same content as my <Link slug="rss-feed">RSS feed</Link>.
        The newest entries are on top.
      </p>

      {feedItems.map(({ title, date, description, content }) => (
        <>
          <h2>
            {date.toLocaleDateString()} | {title || "Update"}
          </h2>
          {description && <blockquote>{description}</blockquote>}
          <p>{content}</p>
        </>
      ))}
    </GenericPageBody>
  ),
});

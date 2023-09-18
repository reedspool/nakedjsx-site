import { OUT_DIR_REL_PATH } from "./constants.mjs";
import Index from ":mdx:../pages/index.mdx";
import { Link } from "../components/Link.jsx";
import { Future } from "../components/Future.jsx";
import { CommonNakedJSXPage } from "./CommonNakedJSXPage.jsx";

const ALL = [{ Body: Index, outName: "index" }];

for (const item of ALL) {
  const { Body, outName } = item;

  CommonNakedJSXPage({
    outputFileName: `${OUT_DIR_REL_PATH}/${outName}.html`,
    Body: () => (
      <main class="cpnt-blog-article">
        <Body components={{ Link, Future }} />
      </main>
    ),
  });
}

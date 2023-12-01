import { OUT_DIR_REL_PATH } from "./constants.mjs";
import Index from ":mdx:../pages/index.mdx";
import LogGame from "../pages/log-game.jsx";
import { Link } from "../components/Link.jsx";
import { Future } from "../components/Future.jsx";
import {
  CommonNakedJSXPage,
  BlogLayout,
  EmptyLayout,
} from "./CommonNakedJSXPage.jsx";

const ALL = [
  { Content: Index, Layout: BlogLayout, outName: "index" },
  { Content: LogGame, Layout: EmptyLayout, outName: "log-game" },
];

for (const item of ALL) {
  const { Content, Layout, outName } = item;

  await CommonNakedJSXPage({
    outputFileName: `${OUT_DIR_REL_PATH}/${outName}.html`,
    Body: () => (
      <Layout>
        <Content components={{ Link, Future }} />
      </Layout>
    ),
  });
}

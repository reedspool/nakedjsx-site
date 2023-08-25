import { Page } from '@nakedjsx/core/page';
import { OUT_DIR_REL_PATH } from './constants.mjs'
import Index from ':mdx:../pages/index.mdx';
import { Link } from "../components/Link.jsx"
import { Future } from "../components/Future.jsx"

const ALL = [
    { Body: Index, outName: "index" }
]

for (const item of ALL) {
    const { Body, outName } = item;
    Page.Create('en');
    Page.AppendHead(<title>Reed's Website</title>)
    Page.AppendHead(<link rel="stylesheet" href="./build.css" />)
    Page.AppendBody(
        <main class="cpnt-blog-article">
            <Body components={{ Link, Future }} />
        </main>
    );
    Page.Render(`${OUT_DIR_REL_PATH}/${outName}.html`);
}

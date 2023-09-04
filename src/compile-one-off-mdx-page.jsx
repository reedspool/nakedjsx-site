import { Page } from '@nakedjsx/core/page';
import { OUT_DIR_REL_PATH } from './constants.mjs'
import Content from ':mdx:../one-off-mdx-pages/project-add-popout.mdx';
import { ScriptTagExperiment } from "./script-tag-component-test.jsx"
import { Link } from "../components/Link.jsx"
import { Future } from "../components/Future.jsx"

Page.Create('en');
Page.AppendHead(<title>Reed's Website</title>)
Page.AppendHead(<meta name="viewport" content="width=device-width, initial-scale=1" />)
Page.AppendHead(<link rel="stylesheet" href="./build.css" />)
Page.AppendBody(
    <main class="cpnt-blog-article">
        <Content {...{ ScriptTagExperiment }} components={{ Link, Future }} />
        <ScriptTagExperiment />
    </main>
);

Page.Render(`${OUT_DIR_REL_PATH}/project-add-popout.html`);

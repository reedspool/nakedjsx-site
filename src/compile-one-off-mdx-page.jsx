import { Page } from '@nakedjsx/core/page';
import { OUT_DIR_REL_PATH } from './constants.mjs'
import Content from ':mdx:../one-off-mdx-pages/project-add-popout.mdx';
import { ScriptTagExperiment } from "./script-tag-component-test.jsx"

Page.Create('en');
Page.AppendHead(<title>Reed's Website</title>)
Page.AppendHead(<link rel="stylesheet" href="./build.css" />)
Page.AppendBody(
    <main class="cpnt-blog-article">
        <Content {...{ ScriptTagExperiment }} />
        <ScriptTagExperiment />
    </main>
);

Page.Render(`${OUT_DIR_REL_PATH}/project-add-popout.html`);

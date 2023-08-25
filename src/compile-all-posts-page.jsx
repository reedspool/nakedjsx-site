import { Page } from '@nakedjsx/core/page';
import posts from ':dynamic:./all.mjs'
import { Link } from "../components/Link.jsx"
import { Future } from "../components/Future.jsx"


for (const [{ inputFileName, outputFileName, shouldCompile }, Post] of posts) {
    // See NOTE in `all.mjs` Line ~50. This should go away when the flag goes away.
    if (!shouldCompile) {
        console.log(`not compiling ${outputFileName} as requested`)
        continue;
    } else {
        console.log(`compiling ${outputFileName}!`)
    }
    Page.Create('en');
    Page.AppendHead(<title>Reed's Website</title>)
    Page.AppendHead(<link rel="stylesheet" href="./build.css" />)
    Page.AppendBody(
        <main class="cpnt-blog-article">
            <Link slug="home">Home</Link>
            <Post originFilename={inputFileName} components={{ Link, Future }} />
            <Link slug="home">Home</Link>
        </main>
    );

    Page.Render(outputFileName);
}

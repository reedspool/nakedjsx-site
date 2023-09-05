import { Page } from '@nakedjsx/core/page';
import posts from './generated-post-imports.mjs'
import { Link } from "../components/Link.jsx"
import { Future } from "../components/Future.jsx"


for (const [{ inputFileName, outputFileName }, Post] of posts) {
    Page.Create('en');
    Page.AppendHead(<title>Reed's Website</title>)
    Page.AppendHead(<meta name="viewport" content="width=device-width, initial-scale=1" />)
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

import { Page } from '@nakedjsx/core/page';
import posts from './generated-post-imports.mjs'
import { Link } from "../components/Link.jsx"
import { Future } from "../components/Future.jsx"


for (const [{ inputFileName, outputFileName }, Post] of posts) {
    Page.Create('en');
    Page.AppendHead(<title>Reed's Website</title>)
    Page.AppendHead(<meta name="viewport" content="width=device-width, initial-scale=1" />)
    Page.AppendHead(<link rel="preconnect" href="https://fonts.googleapis.com" />)
    Page.AppendHead(<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />)
    Page.AppendHead(<link href="https://fonts.googleapis.com/css2?family=Jost&family=Karla&display=swap" rel="stylesheet" />)
    Page.AppendHead(<link rel="stylesheet" href="./build.css" />)
    Page.AppendBody(
        <>
            <header class="sticky">
                    <Link slug="home">Reed's Website</Link>
            </header>
            <main class="cpnt-blog-article">
                <Post originFilename={inputFileName} components={{ Link, Future }} />
            </main>
            <footer><Link slug="home">Home</Link></footer>
        </>
    );

    Page.Render(outputFileName);
}

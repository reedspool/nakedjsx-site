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
            {/*
                Wrap the header and the header AND main content in a growing
                container so that A) the sticky header never scrolls off the
                page (See https://stackoverflow.com/a/47352847) and B) the footer
                always remains squarely on the bottom of the page whether the
                content is shorter than the screen size or way longer. Depends on
                html and body having `height: 100%;` and body being flex-column.
              */}
            <div class="flex-grow">
                <header class="sticky">
                    <div class=" flex flex-row gap-4 items-center font-flashy">
                        <Link slug="home">Reed's Website</Link>
                    </div>
                </header>
                <main class="cpnt-blog-article">
                    <Post originFilename={inputFileName} components={{ Link, Future }} />
                </main>
            </div>
            <footer><Link slug="home">Home</Link></footer>
        </>
    );

    Page.Render(outputFileName);
}

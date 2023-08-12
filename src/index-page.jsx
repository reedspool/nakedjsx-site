import { Page } from '@nakedjsx/core/page';
import posts from ':dynamic:./all.mjs'

// Page.Create('en');
// // Page.AppendBody(<JapanDay1 />);
// Page.Render();

const BodyContent =
    ({ children }) =>
    <main>
        <h1>Body Content H1</h1>
        { children }
    </main>;

for (const [meta, Post] of posts)
{
    Page.Create('en');
    Page.AppendBody(
        <BodyContent>
            <Post originFilename={meta.file} />
        </BodyContent>
    );

    Page.Render(meta.file.replace(/\.mdx$/, '.html'));
}

import { Page } from '@nakedjsx/core/page';
import posts from ':dynamic:./all.mjs'

for (const [{ inputFileName, outputFileName, shouldCompile }, Post] of posts) {
    // See NOTE in `all.mjs` Line ~50. This should go away when the flag goes away.
    if (!shouldCompile) {
        console.log(`not compiling ${outputFileName} as requested`)
        continue;
    } else {
        console.log(`compiling ${outputFileName}!`)
    }
    Page.Create('en');
    Page.AppendBody(
        <main>
            <Post originFilename={inputFileName} />
        </main>
    );

    Page.Render(outputFileName);
}

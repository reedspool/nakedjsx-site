import { Page } from '@nakedjsx/core/page';

const BodyContent =
    ({ children }) =>
        <main>
            <h1>Other Body Content H1</h1>
            {children}
        </main>;
Page.Create('en');
Page.AppendBody(
    <BodyContent>
        This is my other content. Meow.
    </BodyContent>
);

Page.Render('other-page.html');

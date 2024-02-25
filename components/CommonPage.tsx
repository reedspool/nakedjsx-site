export const BlogLayout = ({ children }: { children: JSX.Children }) => (
  <main class="cpnt-blog-article">{children}</main>
);

export const EmptyLayout = ({ children }: { children: JSX.Children }) => (
  <>{children}</>
);

export const CommonPage = ({
  children,
  title = "Reed's Website",
}: {
  children: JSX.Children;
  title?: string;
}) => {
  return (
    <>
      {`<!DOCTYPE html>`}
      <html lang="en">
        <head>
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="shortcut icon" type="image/png" href="favicon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Jost&family=Karla&family=IBM+Plex+Mono&display=swap"
            rel="stylesheet"
          />
          <link rel="stylesheet" href="/build.css" />
          <link
            href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
            rel="stylesheet"
          />
        </head>
        <body>
          {children}

          <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        </body>
      </html>
    </>
  );
};

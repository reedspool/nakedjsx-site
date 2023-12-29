# Reed's Website

This repository has two build targets:

1. A static website, https://reeds.website
2. A server

See [Topic: Operating This Website](./posts/topic-operating-this-website.mdx) for deployment operations explanation and other information.

## Static Site

### Usage

Still early development, so these operations are not well defined and in flux. This document may already be out of date. 

tl;dr: For a fresh install run, 

```sh
npm run build
```

After that, you can run this for a development server:


```sh
npm run static:dev:compile
```

And the same for CSS in a separate terminal:

```sh
npm run static:dev:css
```

Then in a third terminal, serve the build output directory

```sh
npm run static:dev:serve
```

Generating new posts has a few disparate steps. Use this to set

```sh
npm run static:dev:generate-new-post -- "Project: This is the title" then-a-slug-here
```

Steps explained:

#### `npm run build`

This is what Netlify runs to build the site for deployment. 

This may be out of date, but it runs roughly these scripts, described below:

```sh
npm run static:build:clean && \
  npm run static:build:static && \
  npm run static:build:jsxString && \
  npm run static:build:jsxBrowser && \
  npm run static:build:buildCompiler && \
  npm run static:build:compile && \
  npm run static:build:css
```

#### `npm run static:build:clean`

Empty out the ephemeral directories, `build` and `tmp`

#### `npm run static:build:static`

Copy static files from source to the build output directory.

#### `npm run static:build:jsxString` and `npm run static:build:jsxBrowser`

Compile JSX implementation from its sources, one for strings and one for browser elements, to `tmp/` JS files. When you inject these files into a JSX file (or `.tsx`), it provides a JSX implementation that outputs a big string which contains all the HTML.

Each JSX implementation consists of two exports, `MyJSXFactory` and `MyJSXFragmentFactory` which respectively match what I wrote in my `tsconfig.json` entries `jsxFactory` and `jsxFragmentFactory`.

#### `npm run static:build:buildCompiler` 

Prepare for compilation by compiling the compile script from TypeScript to JavaScript I can run with `node`.

#### `npm run static:build:compile`

Compiles all JSX and MDX inputs into HTML outputs. In order to function,
requires that  `static:build:buildCompiler` and `static:build:jsx` were run, and their output
is in the `tmp/` directory.

#### `npm run static:build:css`

Compile Tailwind and the rest of CSS via PostCSS.

#### `npm run static:dev:css`

Runs PostCSS/Tailwind CSS compilation and watches for changes and reruns.

#### `npm run static:dev:compile`

Runs `static:build:compile` and watches for file changes to rerun on any edit of the 
source files.

#### `npm run static:dev:serve`

Run a web server on the output of compilation.

#### `npm run static:dev:generate-new-post`

Runs a utility script to automate some disparate steps involved in writing a new post. Create the file, make a link entry for it, etc. I forget all the things it does, and follow the prompts it gives. I use `git` to check the output of this script after it runs.

## Server for Reed's Website

### Usage

Docker CLI required.

Make sure your terminal is in this directory and not the git project root.

For local development, to build and run the server:

```sh
npm run server:dev:build && npm run server:dev:run
```

To deploy ([`flyctl` CLI required](https://fly.io/docs/hands-on/install-flyctl/)):

```sh
npm run server:build:deploy
```

# Site Generator for Reed's Website

Git repository for [Reed's Website](https://reeds.website)

See [Topic: Operating This Website](./posts/topic-operating-this-website.mdx) for deployment operations explanation and other information.

## Usage

Still early development, so these operations are not well defined and in flux. This document may already be out of date. 

tl;dr: For a fresh install run, 

```sh
npm run build:clean && \
  npm run build:static && \
  npm run build:jsxString && \
  npm run build:jsxBrowser && \
  npm run build:buildCompiler && \
  npm run build:compile && \
  npm run build:css
```

After that, you can run this for a development server:


```sh
npm run dev:compile
```

And the same for CSS in a separate terminal:

```sh
npm run dev:css
```

Then in a third terminal, serve the build output directory

```sh
npm run dev:serve
```

Generating new posts has a few disparate steps. Use this to set

```sh
npm run dev:generate-new-post -- "Project: This is the title" then-a-slug-here
```

Steps explained:

### `npm run build:clean`

Empty out the ephemeral directories, `build` and `tmp`

### `npm run build:static`

Copy static files from source to the build output directory.

### `npm run build:jsxString` and `npm run build:jsxBrowser`

Compile JSX implementation from its sources, one for strings and one for browser elements, to `tmp/` JS files. When you inject these files into a JSX file (or `.tsx`), it provides a JSX implementation that outputs a big string which contains all the HTML.

Each JSX implementation consists of two exports, `MyJSXFactory` and `MyJSXFragmentFactory` which respectively match what I wrote in my `tsconfig.json` entries `jsxFactory` and `jsxFragmentFactory`.

### `npm run build:buildCompiler` 

Prepare for compilation by compiling the compile script from TypeScript to JavaScript I can run with `node`.

### `npm run build:compile`

Compiles all JSX and MDX inputs into HTML outputs. In order to function,
requires that  `build:buildCompiler` and `build:jsx` were run, and their output
is in the `tmp/` directory.

### `npm run build:css`

Compile Tailwind and the rest of CSS via PostCSS.

### `npm run dev:css`

Runs PostCSS/Tailwind CSS compilation and watches for changes and reruns.

### `npm run dev:compile`

Runs `build:compile` and watches for file changes to rerun on any edit of the 
source files.

### `npm run dev:serve`

Run a web server on the output of compilation.

### `npm run dev:generate-new-post`

Runs a utility script to automate some disparate steps involved in writing a new post. Create the file, make a link entry for it, etc. I forget all the things it does, and follow the prompts it gives. I use `git` to check the output of this script after it runs.

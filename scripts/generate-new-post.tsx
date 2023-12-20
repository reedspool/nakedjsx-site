import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises";
console.log(`Running this script from CWD "${process.cwd()}"`);

const [_node, _scriptName, title, optionalSlug] = process.argv;

if (!title) {
  console.error(`Usage:
$ node <script-name> <title> [slug]

Slug is optional. You'll be presented with an automatically generated slug if
you do not provide one. You will be prompted to proceed before any system edits.
`);
  process.exit(128);
}

const slug =
  optionalSlug ?? title.toLowerCase().replaceAll(/[^a-zA-Z0-9\-]+/g, "-");

console.log(
  `Will create project page with \n\nTitle:   '${title}'\nSlug:    '${slug}' (${
    slug === optionalSlug ? "specified" : "generated"
  })\n`,
);

{
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await readlineInterface.question(`Continue?`);
  readlineInterface.close();

  if (!answer.match(/^(y|Y|yes)$/)) process.exit(128);
}

await writeFile(`posts/${slug}.mdx`, `# ${title} \n\n`);

console.log(
  "Future: I tried retriggering my post listing script generation to see if I could avoid restarting my dev server",
);

{
  const path = "./components/Link.json";
  console.log(`Attempting to parse JSON data in Link.json`);
  const links = JSON.parse((await readFile(path)).toString());

  links.slugsToHrefs[slug] = `${slug}.html`;

  console.log(`Writing back the modified Link.json`);

  await writeFile(path, JSON.stringify(links, null, 2));
}

{
  const path = "./posts/topic-project-index.mdx";
  console.log(`Reading project-index.mdx`);

  let content = (await readFile(path)).toString();

  content += `\nI started this post <Link slug="${slug}">here</Link>\n`;

  console.log(`Writing back the modified project-index.mdx`);

  await writeFile(path, content);
}

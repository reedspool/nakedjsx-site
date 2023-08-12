import fsp from 'node:fs/promises';

const POST_DIR_REL_PATH = '../posts'

export default async ({ file, optionsString }) =>
{
    //
    // Create and default export an array of MDX imports
    //

    const mdx = [];
    let js = '';
    let nextImportIndex = 0;

    for (const file of await fsp.readdir(POST_DIR_REL_PATH))
    {
        if (!file.endsWith('.mdx'))
            continue;

        // Import the MDX file via the :mdx: plugin
        const identifier = `mdx_${nextImportIndex++}`
        js += `import ${identifier} from ':mdx:${POST_DIR_REL_PATH}/${file}';\n`;

        // Add the imported result to an array along with some meta information
        mdx.push(`[${JSON.stringify({ file })}, ${identifier}]`);
    }

    const result = `${js}export default [${mdx.join(",")}];`;
    console.log('Result of all.js:', result)
    return result;
}

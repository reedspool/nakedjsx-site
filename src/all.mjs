import { readdir, stat } from 'node:fs/promises';
import { OUT_DIR_REL_PATH } from './constants.mjs'

const POST_DIR_REL_PATH = '../posts'

const exists = async (path) => {
    try {
        await stat(path)
    } catch (error) {
        return false;
    }

    return true;
}

export default async () => {
    // First, check if the output directory exists
    const outputDirectoryExists = exists(OUT_DIR_REL_PATH)

    if (!outputDirectoryExists) console.warn(`Rebuilding entire non-existant output directory \`${OUT_DIR_REL_PATH}\``)

    //
    // Create and default export an array of MDX imports
    //

    const mdx = [];
    let js = '';
    let nextImportIndex = 0;

    for (const inputFileName of await readdir(POST_DIR_REL_PATH)) {
        if (!inputFileName.endsWith('.mdx'))
            continue;

        const fileNameWithoutExtension = inputFileName.replace(/\.mdx$/, '');
        const postPath = `${POST_DIR_REL_PATH}/${inputFileName}`;
        const outputFileName = `${fileNameWithoutExtension}.html`
        const outputPath = `${OUT_DIR_REL_PATH}/${outputFileName}`
        let shouldCompile = true;

        // We'll skip this file if the output is newer than the input
        if (outputDirectoryExists && await exists(outputPath)) {
            // Get the most recent time the input file was modified
            const { mtimeMs: inputModified } = await stat(postPath)

            // Also get the most recent time the output was modified
            const { mtimeMs: outputModified } = await stat(outputPath)

            if (outputModified > inputModified) {
                console.warn(`Skipping ${fileNameWithoutExtension} as the output is newer`)
                // NOTE
                // In the future, I'd like to just `continue` here and not even
                // export it. But if it's not imported right now there's a bug in the
                // development server where it will never register it as a file to watch.
                // So instead right now we just pass a flag to not compile it
                shouldCompile = false;
            };
        }

        // Import the MDX file via the :mdx: plugin
        const identifier = `mdx_${nextImportIndex++}`
        js += `import ${identifier} from ':mdx:${postPath}';\n`;

        // Add the imported result to an array along with some meta information
        mdx.push(`[${JSON.stringify({ inputFileName, outputFileName, shouldCompile })}, ${identifier}]`);
    }

    const result = `${js}export default [${mdx.join(",")}];`;
    console.log('Result of all.mjs:\n', result)
    return result;
}

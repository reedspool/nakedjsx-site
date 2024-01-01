import esbuild from "esbuild";

console.log(`Running this script from CWD "${process.cwd()}"`);

const entryPointPath = "server/src/index.tsx";
const outPath = "build/index.js";
console.log(`Using esbuild to compile TSX '${entryPointPath}' to '${outPath}'`);
await esbuild.build({
  entryPoints: [entryPointPath],
  bundle: true,
  target: "esnext",
  format: "esm",
  platform: "node",
  outfile: outPath,
  inject: ["tmp/MyJSXStringImplementation.js"],
  plugins: [],
});

import posts from "./generated-post-imports.mjs";
import { Link } from "../components/Link.jsx";
import { Future } from "../components/Future.jsx";
import { CommonNakedJSXPage } from "./CommonNakedJSXPage.jsx";
import { GenericPageBody } from "../components/GenericPageBody.jsx";

for (const [{ inputFileName, outputFileName }, Post] of posts) {
  await CommonNakedJSXPage({
    outputFileName,
    Body: () => (
      <GenericPageBody>
        <Post originFilename={inputFileName} components={{ Link, Future }} />
      </GenericPageBody>
    ),
  });
}

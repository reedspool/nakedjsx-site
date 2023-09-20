import { LogoSVG, LogoSVGSymbol } from "../components/LogoSVGSymbol.jsx";
import { Link } from "../components/Link.jsx";
export const GenericPageBody = ({ children }) => (
  <>
    <LogoSVGSymbol />
    {/*
                Wrap the header and the header AND main content in a growing
                container so that A) the sticky header never scrolls off the
                page (See https://stackoverflow.com/a/47352847) and B) the footer
                always remains squarely on the bottom of the page whether the
                content is shorter than the screen size or way longer. Depends on
                html and body having `height: 100%;` and body being flex-column.
              */}
    <div class="flex-grow">
      <header class="sticky">
        <div class=" flex flex-row gap-4 items-center font-flashy">
          <LogoSVG />
          <Link slug="home">Reed's Website</Link>
        </div>
      </header>
      <main class="cpnt-blog-article">{children}</main>
    </div>
    <footer>
      <div class="flex flex-row gap-4">
        <Link slug="home">Home</Link>

        <Link slug="rss-feed">
          RSS <i className={`bx bx-rss align-middle ml-sm inline-block`} />
        </Link>

        <Link slug="feed">
          Updates{" "}
          <i className={`bx bx-calendar align-middle ml-sm inline-block`} />
        </Link>

        <a href="https://www.github.com/reedspool/nakedjsx-site">
          GitHub{" "}
          <i className={`bx bxl-github align-middle ml-sm inline-block`} />
        </a>
      </div>
    </footer>
  </>
);

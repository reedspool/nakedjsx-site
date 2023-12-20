export interface Components extends Record<string, any> {
  Link: (...args: any[]) => JSX.Element;
}
export const Body = ({ components: { Link } }: { components: Components }) => (
  <>
    <div>
      <button class="cpnt-button">
        Fast-forward{" "}
        <i class={`bx bx-fast-forward align-middle ml-sm inline-block`} />
      </button>
    </div>

    <pre data-game class="whitespace-normal h-[50vh] overflow-scroll"></pre>

    <Link slug="project-log-game">Project page</Link>

    <script src="./log-game-client.js" type="module"></script>
  </>
);

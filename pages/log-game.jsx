export default ({ components: { Link } }) => (
  <>
    <div>
      <button class="cpnt-button">
        Fast-forward{" "}
        <i class={`bx bx-fast-forward align-middle ml-sm inline-block`} />
      </button>
    </div>

    <pre data-game class="whitespace-normal h-[50vh] overflow-scroll"></pre>

    <Link slug="project-log-game">Project page</Link>
  </>
);

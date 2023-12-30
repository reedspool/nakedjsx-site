import type { Database } from "server/src/supabaseGeneratedTypes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type WeightRecords = Array<
  Database["public"]["Tables"]["fitness_record_weight"]["Row"]
>;

export const Layout = ({ children }: { children: JSX.Children }) => {
  return (
    <main class="cpnt-bleed-layout">
      <header class="cpnt-bleed-layout layout-full">
        <div class="flex flex-row gap-4">
          <a href="/entry">
            New Entry{" "}
            <i class={`bx bx-calendar-plus align-middle ml-sm inline-block`} />
          </a>
          <a href="/history">
            History{" "}
            <i class={`bx bx-calendar align-middle ml-sm inline-block`} />
          </a>
        </div>
      </header>
      {children}
    </main>
  );
};

export const Components = {
  "cpnt-body-weight-entry": () => (
    <form class="cpnt-bleed-layout items-start" method="POST" action="/entry">
      <label>
        Kilograms
        <input
          autofocus
          type="number"
          name="kilograms"
          value="255"
          min="0"
          max="99999"
          step="0.01"
        />
      </label>

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-history": ({ records }: { records: WeightRecords }) => (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Kilograms</th>
        </tr>
      </thead>
      <tbody>
        {records.map(({ created_at, kilograms }) => {
          return (
            <tr>
              <td>{dayjs().to(dayjs(created_at), false)}</td>
              <td>{kilograms}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
} as const;

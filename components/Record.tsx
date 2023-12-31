import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FitnessRecordWeightRow,
  FitnessRecordWeightRows,
} from "server/src/types";
dayjs.extend(relativeTime);

function serverDateTimeStringToInputDateTimeLocalValueString(date: string) {
  return dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS");
}

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
  "cpnt-body-weight-entry-edit": ({
    entry: { id, kilograms, created_at },
  }: {
    entry: FitnessRecordWeightRow;
  }) => (
    <form
      class="cpnt-bleed-layout items-start"
      method="POST"
      action={`/entries/${id}/edit`}
    >
      <label>
        Time{" "}
        <input
          type="datetime-local"
          name="created_at"
          value={serverDateTimeStringToInputDateTimeLocalValueString(
            created_at,
          )}
        />
      </label>
      <label>
        Kilograms{" "}
        <input
          autofocus
          type="number"
          name="kilograms"
          value={kilograms}
          min="0"
          max="99999"
          step="0.01"
        />
      </label>

      <a href={`/entries/${id}/delete`}>Delete?</a>

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-entry-delete": ({
    entry: { id, kilograms, created_at },
  }: {
    entry: FitnessRecordWeightRow;
  }) => (
    <form
      class="cpnt-bleed-layout items-start"
      method="POST"
      action={`/entries/${id}/delete`}
    >
      <p>
        You are about to delete the entry from
        {serverDateTimeStringToInputDateTimeLocalValueString(created_at)} with
        the measurement {kilograms}kg. You cannot undo this. Continue?
      </p>

      <input type="submit" value="Delete" class="bg-red-800 text-flashybg" />
      <a href={`/entries/${id}/edit`}>Back to edit</a>
    </form>
  ),
  "cpnt-body-weight-entry": () => (
    <form class="cpnt-bleed-layout items-start" method="POST" action="/entry">
      <label>
        Kilograms{" "}
        <input
          autofocus
          type="number"
          name="kilograms"
          min="0"
          max="99999"
          step="0.01"
        />
      </label>

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-history": ({
    records,
  }: {
    records: FitnessRecordWeightRows;
  }) => (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Kilograms</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {records.map(({ id, created_at, kilograms }) => {
          return (
            <tr>
              <td>{dayjs().to(dayjs(created_at), false)}</td>
              <td>{kilograms}</td>
              <td>
                <a href={`/entries/${id}/edit?id=${id}`} class="no-underline">
                  Edit{" "}
                  <i
                    class={`bx bx-edit align-middle ml-sm inline-block font-[1.25em]`}
                  />
                </a>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
} as const;

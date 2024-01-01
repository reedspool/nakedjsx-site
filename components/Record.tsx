import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  FitnessRecordUserPreferencesRowSettings,
  FitnessRecordWeightRow,
  FitnessRecordWeightRows,
} from "server/src/types";
import { kilogramsToPounds } from "src/utilities";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

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

          <a href="/me">
            Me <i class={`bx bx-cog align-middle ml-sm inline-block`} />
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
    measurementInput,
  }: {
    entry: FitnessRecordWeightRow;
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
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
      {measurementInput === "kilograms" && (
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
      )}
      {measurementInput === "pounds" && (
        <label>
          Pounds{" "}
          <input
            autofocus
            type="number"
            name="pounds"
            value={kilogramsToPounds(kilograms).toFixed(1)}
            min="0"
            max="99999"
            step="0.01"
          />
        </label>
      )}

      <a href={`/entries/${id}/delete`}>Delete?</a>

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-entry-delete": ({
    entry: { id, kilograms, created_at },
    measurementInput,
  }: {
    entry: FitnessRecordWeightRow;
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
  }) => (
    <form
      class="cpnt-bleed-layout items-start"
      method="POST"
      action={`/entries/${id}/delete`}
    >
      <p>
        You are about to delete the entry from{" "}
        <time datetime={dayjs(created_at).toISOString()}>
          {dayjs(created_at).format("LLLL")}
        </time>{" "}
        with the measurement{" "}
        <CpntInlineWeight
          kilograms={kilograms}
          measurementInput={measurementInput}
        />
        . You cannot undo this. Continue?
      </p>

      <input type="submit" value="Delete" class="bg-red-800 text-flashybg" />
      <a href={`/entries/${id}/edit`}>Back to edit</a>
    </form>
  ),
  "cpnt-body-weight-user-preferences": ({
    settings: { measurementInput },
  }: {
    settings: FitnessRecordUserPreferencesRowSettings;
  }) => (
    <form class="cpnt-bleed-layout items-start" method="POST" action={`/me`}>
      <h1>User Settings</h1>
      <fieldset>
        <legend>Input and Display Measurement Units</legend>

        <p>
          In the server, your measurement is always stored as kilograms, because
          we humans have 10 fingers. In what unit do you want to enter and view
          your measurements?
        </p>

        <label>
          Pounds (lbs)
          <input
            type="radio"
            name="measurementInput"
            value="pounds"
            checked={"pounds" === measurementInput}
          />
        </label>

        <label>
          Kilograms (kg)
          <input
            type="radio"
            name="measurementInput"
            value="kilograms"
            checked={"kilograms" === measurementInput}
          />
        </label>
      </fieldset>

      <input type="hidden" name="timezone" value="utc" />
      <input type="hidden" name="version" value="v1" />

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-entry": ({
    measurementInput,
  }: {
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
  }) => (
    <form class="cpnt-bleed-layout items-start" method="POST" action="/entry">
      {measurementInput === "kilograms" && (
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
      )}
      {measurementInput === "pounds" && (
        <label>
          Pounds{" "}
          <input
            autofocus
            type="number"
            name="pounds"
            min="0"
            max="99999"
            step="0.01"
          />
        </label>
      )}

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-history": ({
    records,
    measurementInput,
  }: {
    records: FitnessRecordWeightRows;
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
  }) => (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          {measurementInput === "kilograms" && <th>Kilograms</th>}
          {measurementInput === "pounds" && <th>Pounds</th>}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {records.map(({ id, created_at, kilograms }) => {
          return (
            <tr>
              <td>
                <time datetime={dayjs(created_at).toISOString()}>
                  {dayjs().to(dayjs(created_at), false)}
                </time>
              </td>
              <td>
                <CpntInlineWeight
                  kilograms={kilograms}
                  measurementInput={measurementInput}
                />
              </td>
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

  "cpnt-body-weight-404": ({
    message,
    error,
  }: {
    message?: string;
    error?: { status?: number };
  }) => (
    <div class="flex flex-col gap-4">
      <h1>404 Not Found</h1>
      <p>Sorry, that URL didn't show up for itself or its friends today.</p>
      <p>
        <a href="/">Home page</a>
      </p>
      {message || error ? <h2>Error (development)</h2> : null}
      {message && <blockquote>{message}</blockquote>}

      {error && (
        <pre>
          <code>{error}</code>
        </pre>
      )}
    </div>
  ),
  "cpnt-body-weight-5XX": ({
    message,
    error,
  }: {
    message?: string;
    error?: { status?: number };
  }) => (
    <div class="flex flex-col gap-4">
      <h1>5XX Injury</h1>
      <p>The server fumbled. Must ice, compress, and elevate.</p>
      <p>
        <a href="/">Home page</a>
      </p>
      {message || error ? <h2>Error (development)</h2> : null}
      {message && <blockquote>{message}</blockquote>}

      {error && (
        <pre>
          <code>{error}</code>
        </pre>
      )}
    </div>
  ),
  ["cpnt-inline-weight"]: ({
    kilograms,
    measurementInput,
  }: {
    kilograms: FitnessRecordWeightRow["kilograms"];
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
  }) => {
    let weight = kilograms;
    let units = "kg";
    if (measurementInput === "pounds") {
      weight = kilogramsToPounds(kilograms);
      units = "lb";
    }
    return (
      <span>
        {weight.toFixed(1)} {units}
      </span>
    );
  },
} as const;

const CpntInlineWeight = Components["cpnt-inline-weight"];

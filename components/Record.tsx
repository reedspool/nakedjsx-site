import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  FitnessRecordUserPreferencesRowSettings,
  FitnessRecordWeightRow,
  FitnessRecordWeightRows,
} from "server/src/types";
import { kilogramsToPounds } from "src/utilities";
import { timeZones } from "server/src/timeZones";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

function serverDateTimeStringToInputDateTimeLocalValueString(
  date: string,
  timeZone: FitnessRecordUserPreferencesRowSettings["timezone"],
) {
  return dayjs.utc(date).tz(timeZone).format("YYYY-MM-DDTHH:mm:ss.SSS");
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
    timeZone,
  }: {
    entry: FitnessRecordWeightRow;
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
    timeZone: FitnessRecordUserPreferencesRowSettings["timezone"];
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
            timeZone,
          )}
        />
      </label>
      {measurementInput === "kilograms" && (
        <label>
          <input
            autofocus
            type="number"
            name="kilograms"
            value={kilograms}
            min="0"
            max="99999"
            step="0.01"
          />{" "}
          kg
        </label>
      )}
      {measurementInput === "pounds" && (
        <label>
          <input
            autofocus
            type="number"
            name="pounds"
            value={kilogramsToPounds(kilograms).toFixed(1)}
            min="0"
            max="99999"
            step="0.01"
          />{" "}
          lb
        </label>
      )}

      <a href={`/entries/${id}/delete`}>Delete?</a>

      <input type="submit" value="Submit" />
    </form>
  ),
  "cpnt-body-weight-entry-delete": ({
    entry: { id, kilograms, created_at },
    measurementInput,
    timeZone,
  }: {
    entry: FitnessRecordWeightRow;
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
    timeZone: FitnessRecordUserPreferencesRowSettings["timezone"];
  }) => (
    <form
      class="cpnt-bleed-layout items-start"
      method="POST"
      action={`/entries/${id}/delete`}
    >
      <p>
        You are about to delete the entry from{" "}
        <time datetime={dayjs.utc(created_at).toISOString()}>
          {dayjs.utc(created_at).tz(timeZone).format("LLLL")}
        </time>{" "}
        with the measurement{" "}
        <CpntInlineWeight
          kilograms={kilograms}
          measurementInput={measurementInput}
        />
        . You cannot undo this. Continue?
      </p>

      <input type="submit" value="Delete" class="!bg-red-800 !text-flashybg" />
      <a href={`/entries/${id}/edit`}>Back to edit</a>
    </form>
  ),
  "cpnt-body-weight-user-preferences": ({
    settings: { measurementInput, timezone },
  }: {
    settings: FitnessRecordUserPreferencesRowSettings;
  }) => (
    <form
      class="cpnt-bleed-layout gap-y-4 items-start"
      method="POST"
      action={`/me`}
    >
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

      <input type="submit" value="Submit" />

      <fieldset>
        <legend>Time Zone</legend>

        <p>
          All times are persisted in UTC. They are translated to your preferred
          timezone when rendered.
        </p>

        <p>
          Your current time zone is "{timezone}". The current time is{" "}
          <time datetime={dayjs.utc().toISOString()}>
            {dayjs.utc().tz(timezone).format("LLLL")}
          </time>
          .
        </p>

        <label>
          Set your display time zone
          <select name="timezone">
            {timeZones.map((tz) => (
              <option value={tz} selected={tz === timezone}>
                {tz}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <input type="submit" value="Submit" />

      <input type="hidden" name="version" value="v1" />
    </form>
  ),
  "cpnt-body-weight-entry": ({
    measurementInput,
  }: {
    measurementInput: FitnessRecordUserPreferencesRowSettings["measurementInput"];
  }) => (
    <form
      class="cpnt-bleed-layout gap-y-4 items-start"
      method="POST"
      action="/entry"
    >
      {measurementInput === "kilograms" && (
        <label>
          <input
            class="w-full max-w-[60%] ml-[20%] py-1 pl-1 text-lg"
            autofocus
            type="number"
            name="kilograms"
            min="0"
            max="99999"
            step="0.01"
          />{" "}
          <span class="text-lg">kg</span>
        </label>
      )}
      {measurementInput === "pounds" && (
        <label>
          <input
            class="w-full max-w-[60%] ml-[20%] py-1 pl-1 text-lg"
            autofocus
            type="number"
            name="pounds"
            min="0"
            max="99999"
            step="0.01"
          />{" "}
          <span class="text-lg">lb</span>
        </label>
      )}

      <input type="submit" class="text-lg" value="Submit" />
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
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
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

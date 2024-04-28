const css = (strs: { raw: ArrayLike<string> }, ...rest: any[]) =>
  String.raw(strs, ...rest);
const arrayFrom1ToN = (n: number) =>
  Array(n)
    .fill(null)
    .map((_, index) => index + 1);
const NUM_OF_NUM_CARDS = 21;
type Tag = "beginner" | "confusing" | "silly" | "movement" | "mature";
const communicationMethods: Array<{
  main: string;
  tag?: Array<Tag>;
  higherNumberHotTip?: string;
  lowerNumberHotTip?: string;
}> = [
  {
    main: "Only say words which rhyme with your number.",
    tag: ["beginner"],
  },
  {
    main: "Only say historical events.",
    tag: ["silly"],
  },
  {
    main: "Only flex your arm.",
    tag: ["confusing"],
  },
  {
    main: "Make the shape of your number with your arms and body",
    tag: ["beginner", "movement", "silly"],
  },
  {
    main: "Only say names of famous people.",
    tag: ["confusing"],
  },
  {
    main: "Only laugh.",
    higherNumberHotTip: "Louder if your number is higher.",
    lowerNumberHotTip: "Softer if your number is lower.",
    tag: ["beginner"],
  },
  {
    main: "Act out your number as a temperature.",
    higherNumberHotTip: "Higher is warmer.",
    lowerNumberHotTip: "Lower is colder.",
    tag: ["silly"],
  },
  {
    main: "Say your number backwards.",
    tag: ["beginner"],
  },
  {
    main: "Say your number in a different language.",
    higherNumberHotTip: "Can you make up a language?",
    tag: ["beginner"],
  },
  {
    main: "Spell out your number in Roman numerals.",
    tag: ["beginner"],
  },
  {
    main: "Use the height of your hand off a surface.",
    tag: ["beginner", "movement"],
  },
  {
    main: "Stomp your feet.",
    tag: ["confusing", "silly", "movement"],
  },
  {
    main: "Use sounds but no words.",
    tag: ["beginner", "confusing", "silly"],
  },
  {
    main: "Only say foods.",
    tag: ["beginner"],
  },
  {
    main: "Only say furniture.",
    tag: ["silly", "confusing"],
  },
  {
    main: "Only say movie titles.",
    tag: ["beginner"],
  },
  {
    main: "Only say song lyrics.",
    tag: ["beginner"],
  },
  {
    main: "Only blink and use the direction of your eyes.",
    tag: ["confusing", "silly"],
  },
  {
    main: "Say 100 minus your number.",
    tag: ["beginner"],
  },
  {
    main: "Only say units of measurement.",
    tag: ["silly", "confusing"],
  },
  {
    main: "Only say vehicles.",
    tag: ["silly", "confusing"],
  },
  {
    main: "Silently act out your number as if you were that many years old.",
    tag: ["silly"],
  },
  {
    main: "Walk around to form a line in order.",
    higherNumberHotTip: "Higher numbers in the back.",
    lowerNumberHotTip: "Lower numbers lead in the front.",
    tag: ["movement", "silly", "beginner"],
  },
  {
    main: "Only say your number all together, on the count of three.",
  },
  {
    main: "Only say sexual acts/positions",
    tag: ["mature", "confusing"],
  },
  {
    main: "Only say names of drugs and alcoholic drinks",
    tag: ["mature", "confusing"],
  },
  {
    main: "Only sing or hum a tone",
    tag: ["silly", "beginner"],
  },
];

type CommunicationMethods = typeof communicationMethods;
type CommunicationMethod = CommunicationMethods[0];

const symbolsToMaterialSymbolsContent: { [key in string | Tag]: string } = {
  communication: "record_voice_over",
  saboteur: "dangerous",
  mature: "no_adult_content",
  confusing: "psychology_alt",
  movement: "run_circle",
  silly: "offline_bolt",
  beginner: "account_child",
  information: "help",
} as const;
export const MaterialSymbol = ({
  which,
  classList = "",
}: {
  which: keyof typeof symbolsToMaterialSymbolsContent;
  classList?: string;
}) => (
  <span
    class={`material-symbols-outlined ${classList}`}
    title={`${which} -> ${symbolsToMaterialSymbolsContent[which]}`}
  >
    {symbolsToMaterialSymbolsContent[which]}
  </span>
);
export const Body = () => (
  <div class="container">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    />
    <style>{css`
      .material-symbols-outlined {
        font-variation-settings:
          "FILL" 0,
          "wght" 400,
          "GRAD" 0,
          "opsz" 24;
      }
      body {
        --fancy-font-family: "Special Elite", system-ui;

        font-size: 20pt;
        line-height: 1.2em;
        --font-color: #3e3e3e;
        color: var(--font-color);
      }
      @page {
        margin: 0.1in;
        size: 8.5in 11in;
        @top-right {
          content: "Page " counter(pageNumber);
          border: 5px solid red;
        }
      }
      .container {
        /* https://en.wikipedia.org/wiki/Bicycle_Playing_Cards */
        --poker-card-height: 3.5in;
        --poker-card-width: 2.5in;
        /* https://themagiccafe.com/forums/viewtopic.php?topic=382099 */
        --poker-card-corner-radius: 0.125in;
        --card-height: var(--poker-card-height);
        --card-width: var(--poker-card-width);
        /* empirical, want the inner corner to appear at the center of the curve */
        --card-padding-y: 0.1in;
        --card-padding-x: 0.07in;
        --card-corner-radius: var(--poker-card-corner-radius);
        --margin: 0.05in;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        gap: var(--margin);
      }

      .container--grid {
        /* Preserving the grid try while I switch to flex */

        display: grid;
        grid-gap: 0.05in;
        grid-template-columns: repeat(auto-fill, var(--card-width));
        grid-template-rows: repeat(auto-fill, var(--card-height));
        grid-template-rows: auto;
        justify-content: space-evenly;
        align-content: space-evenly;
        justify-items: space-evenly;
        align-items: space-evenly;
      }
      .card__container {
        box-sizing: border-box;
        height: var(--card-height);
        width: var(--card-width);
        border-radius: var(--card-corner-radius);
        background-color: darkgray;
        padding: var(--card-padding-y) var(--card-padding-x);
      }
      .card {
        box-sizing: border-box;
        font-family: var(--fancy-font-family);
        height: calc(var(--card-height) - (2 * var(--card-padding-y)));
        width: calc(var(--card-width) - (2 * var(--card-padding-x)));
        background-color: #e3e3e3;
        padding: 0.1in; /* empirical */

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      .card:nth-child(9n) {
        break-after: page;
      }

      .card__number {
        font-family: var(--fancy-font-family);
        font-size: 56pt;
      }

      .card-header {
        font-size: 20pt;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      .card-header--bottom {
        transform-origin: center center;
        transform: rotate(180deg);
      }
      .card-header-tags {
        color: darkgray;
      }
      .card__number[data-number="6"] .card__number-body,
      .card__number[data-number="9"] .card__number-body {
        text-decoration: underline;
      }
      .card__number-body {
      }
      .card__key-card-body {
        font-size: 12pt;
      }
      .card__key-card-body .material-symbols-outlined {
        vertical-align: text-bottom;
      }
      .page-break {
        height: 0px;
        width: 0px;
        break-after: page;
      }
    `}</style>
    {arrayFrom1ToN(NUM_OF_NUM_CARDS).map((n) => (
      <NumberCard num={n} />
    ))}
    <SaboteurCard />
    <KeyCard />
    {communicationMethods.map(CommunicationMethodCard)}
    {/* Blanks, N to fill out the current page + an entire page which one can
      skip when they hit the print button */}
    {arrayFrom1ToN(
      9 -
        ((NUM_OF_NUM_CARDS +
          communicationMethods.length +
          2) /* 1 saboteur, 1 key card */ %
          9) +
        9,
    ).map(() => (
      <CommunicationMethodCard main={""} />
    ))}
  </div>
);
const CardContainer = ({ children }: { children: JSX.Children }) => (
  <div class="card__container">{children}</div>
);

const tagPriority: Array<Tag> = [
  "mature",
  "beginner",
  "confusing",
  "silly",
  "movement",
];
const tagSort = (a: Tag, b: Tag) => {
  return tagPriority.indexOf(a) - tagPriority.indexOf(b);
};

const CommunicationMethodCard = ({ main, tag = [] }: CommunicationMethod) => {
  const HeaderContent = () => (
    <>
      <MaterialSymbol which="communication" />
      <span class="card-header-tags">
        {tag.sort(tagSort).map((tag) => (
          <MaterialSymbol which={tag} />
        ))}
      </span>
    </>
  );
  return (
    <CardContainer>
      <div class="card">
        <div class="card-header">
          <HeaderContent />
        </div>
        <div class="">{main}</div>
        <div class="card-header card-header--bottom">
          <HeaderContent />
        </div>
      </div>
    </CardContainer>
  );
};
const NumberCard = ({ num }: { num: number }) => (
  <CardContainer>
    <div class="card card__number" data-number={num}>
      <div class="card-header">{num}</div>
      <div class="card__number-body">{num}</div>
      <div class="card-header card-header--bottom">{num}</div>
    </div>
  </CardContainer>
);

const SaboteurCard = () => (
  <CardContainer>
    <div class="card">
      <div class="card-header">
        <MaterialSymbol which="saboteur" />
      </div>
      <div class="">
        You are the saboteur. Mess with them. Don't get caught.
      </div>
      <div class="card-header card-header--bottom">
        <MaterialSymbol which="saboteur" />
      </div>
    </div>
  </CardContainer>
);

const KeyCard = () => {
  const HeaderContent = () => (
    <>
      <MaterialSymbol which="information" />
    </>
  );
  return (
    <CardContainer>
      <div class="card ">
        <div class="card-header">
          <HeaderContent />
        </div>
        <div class="card__key-card-body">
          <div style="text-decoration: underline;">Key</div>
          <div>
            <MaterialSymbol which="communication" /> Communication card
          </div>
          <div>
            <MaterialSymbol which="mature" /> Mature/Adult
          </div>
          <div>
            <MaterialSymbol which="beginner" /> Good for beginners!
          </div>
          <div>
            <MaterialSymbol which="silly" /> A little silly!
          </div>
          <div>
            <MaterialSymbol which="confusing" /> A little confusing!
          </div>
          <div>
            <MaterialSymbol which="movement" /> Requires movement
          </div>
        </div>
        <div class="card-header card-header--bottom">
          <HeaderContent />
        </div>
      </div>
    </CardContainer>
  );
};

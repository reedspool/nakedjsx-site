const css = (strs: { raw: ArrayLike<string> }, ...rest: any[]) =>
  String.raw(strs, ...rest);
const arrayFrom1ToN = (n: number) =>
  Array(n)
    .fill(null)
    .map((_, index) => index + 1);
const NUM_OF_NUM_CARDS = 21;
const NUM_ROWS_PER_PAGE = 3;
const NUM_COLS_PER_PAGE = 3;
const NUM_CARDS_PER_PAGE = NUM_ROWS_PER_PAGE * NUM_COLS_PER_PAGE;
type Tag = "beginner" | "confusing" | "silly" | "movement" | "mature";
const communicationMethods: Array<{
  main: string;
  tag?: Array<Tag>;
  higherNumberHotTip?: string;
  lowerNumberHotTip?: string;
}> = [
  {
    main: "Words which rhyme with your number.",
    tag: ["beginner"],
  },
  {
    main: "Historical events.",
    tag: ["silly"],
  },
  {
    main: "Flex your arm.",
    tag: ["confusing"],
  },
  {
    main: "Make the shape of your number with your arms and body.",
    tag: ["beginner", "movement", "silly"],
  },
  {
    main: "Names of famous people.",
    tag: ["confusing"],
  },
  {
    main: "Laugh.",
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
    main: "Foods.",
    tag: ["beginner"],
  },
  {
    main: "Furniture.",
    tag: ["silly", "confusing"],
  },
  {
    main: "Movie titles.",
    tag: ["beginner"],
  },
  {
    main: "Song lyrics.",
    tag: ["beginner"],
  },
  {
    main: "Blink and use the direction of your eyes.",
    tag: ["confusing", "silly"],
  },
  {
    main: "100 minus your number.",
    tag: ["beginner"],
  },
  {
    main: "Units of measurement.",
    tag: ["silly", "confusing"],
  },
  {
    main: "Vehicles.",
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
    main: "Say your number all together, on the count of three.",
  },
  {
    main: "Sexual acts/positions",
    tag: ["mature", "confusing"],
  },
  {
    main: "Names of drugs and alcoholic drinks",
    tag: ["mature", "confusing"],
  },
  {
    main: "Sing or hum a tone",
    tag: ["silly", "beginner"],
  },
  {
    main: "Superheroes.",
    tag: ["silly"],
  },
  {
    main: "Colors.",
    tag: ["silly"],
  },
  {
    main: "Flavors.",
    tag: ["silly"],
  },
  {
    main: "Vacations.",
    tag: ["silly"],
  },
];

type CommunicationMethods = typeof communicationMethods;
type CommunicationMethod = CommunicationMethods[0];

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

const symbolsToMaterialSymbolsContent: { [key in string | Tag]: string } = {
  communication: "record_voice_over",
  saboteur: "dangerous",
  mature: "no_adult_content",
  confusing: "psychology_alt",
  movement: "run_circle",
  silly: "person_play",
  beginner: "account_child",
  information: "help",
  number: "numbers",
} as const;
const symbols = Object.keys(symbolsToMaterialSymbolsContent);

Object.values(communicationMethods).forEach(({ tag }) => {
  // TODO rename tag to tags
  tag?.forEach((tag) => {
    // tagPriority must include all used tags
    // TODO Can this be done with Typescript? Couldn't figure out how
    if (tagPriority.indexOf(tag) == -1)
      throw new Error(`tagPriority missing '${tag}'`);

    // symbols must include all used tags (can include whatever else)
    // TODO Can this be done with TypeScript? Couldn't figure out how
    if (symbols.indexOf(tag) == -1) throw new Error(`symbols missing '${tag}'`);
  });
});

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
const CardContainer = ({
  children,
  classList = "",
}: {
  children: JSX.Children;
  classList?: string;
}) => <div class={`card__container ${classList}`}>{children}</div>;
const Empty = () => <></>;
const StandardCard = ({
  HeaderContent = Empty,
  BodyContent = Empty,
  FooterContent,
  classList = "",
}: {
  HeaderContent?: () => JSX.Element;
  FooterContent?: () => JSX.Element;
  BodyContent?: () => JSX.Element;
  classList?: string;
}) => {
  if (!FooterContent) FooterContent = HeaderContent;
  return (
    <CardContainer classList={classList}>
      <div class={`card`}>
        <div class="card-header">
          <HeaderContent />
        </div>
        <div class="card__body">
          <BodyContent />
        </div>
        <div class="card-header card-header--bottom">
          <FooterContent />
        </div>
      </div>
    </CardContainer>
  );
};

const CommunicationMethodCard = ({ main, tag = [] }: CommunicationMethod) => {
  return (
    <StandardCard
      classList="card-communication"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="communication" />
          <span class="card-header-tags">
            {tag.sort(tagSort).map((tag) => (
              <MaterialSymbol which={tag} />
            ))}
          </span>
        </>
      )}
      BodyContent={() => main}
    />
  );
};
const NumberCard = ({ num }: { num: number }) => {
  return (
    <StandardCard
      classList={
        "card-number " +
        (num === 9 || num === 6 ? "card-number--confusing-orientation" : "")
      }
      HeaderContent={() => (
        <>
          <span>{num}</span>
        </>
      )}
      FooterContent={() => (
        <>
          <span>{num}</span>
        </>
      )}
      BodyContent={() => "#"}
    />
  );
};

const SaboteurCard = () => {
  return (
    <StandardCard
      classList="card-number card-number__saboteur"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="saboteur" />
          <MaterialSymbol which="saboteur" />
        </>
      )}
      BodyContent={() =>
        "You are the saboteur. Mess with them. Don't get caught."
      }
    />
  );
};

const KeyCard = () => {
  return (
    <StandardCard
      classList="card-key"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
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
        </>
      )}
    />
  );
};
const RulesCard1 = () => {
  return (
    <StandardCard
      classList="card-rules"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
          <p style="text-decoration: underline;">Rules 1/4</p>
          <p>
            Deal a random Number (<span>#</span>) to each player. Your Number is{" "}
            <em>your secret</em>. The Numbers go from 1 to {NUM_OF_NUM_CARDS}.
          </p>
          <p>
            One player (the Director) draws a Directive
            <span>
              {" "}
              (<MaterialSymbol which="communication" />)
            </span>
            .
          </p>
          <p>
            Everyone cooperates to reveal each Number in order from lowest to
            highest.
          </p>
        </>
      )}
    />
  );
};

const RulesCard2 = () => {
  return (
    <StandardCard
      classList="card-rules"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
          <p style="text-decoration: underline;">Rules 2/4</p>
          <p>
            The Director has the final say. Don't reveal your Number until the
            Director tells you to.
          </p>
          <p>
            You must only communicate the value on your Number via the
            Directive. You can't say any number or show numbers on your fingers
            unless the Directive says.
          </p>
        </>
      )}
    />
  );
};
const RulesCard3 = () => {
  return (
    <StandardCard
      classList="card-rules"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
          <p style="text-decoration: underline;">Rules 3/4</p>
          <p>
            The Directives are vague. You must discuss how to interpret the
            Directive amongst you (without saying numbers!)
          </p>
          <p>
            You can't lose the game. But, if you say a number or reveal a Number
            out of order, you get a Strike. Try to get fewer Strikes each round!
          </p>
        </>
      )}
    />
  );
};

const RulesCard4 = () => {
  return (
    <StandardCard
      classList="card-rules"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
          <p style="text-decoration: underline;">Rules 4/4</p>
          <p>The round ends when all the Numbers are revealed.</p>
          <p>
            The Director for the next round is the person to the left of the
            current Director.{" "}
          </p>
          <p>Shuffle and re-deal the Numbers and pick a new Directive!</p>
        </>
      )}
    />
  );
};

const InformationCardBack = () => {
  return (
    <StandardCard
      classList="card-back"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="information" />
        </>
      )}
      BodyContent={() => (
        <>
          <MaterialSymbol which="information" />
        </>
      )}
    />
  );
};

const CommunicationMethodCardBack = () => {
  return (
    <StandardCard
      classList="card-back card-communication"
      HeaderContent={() => (
        <>
          <MaterialSymbol which="communication" />
        </>
      )}
      BodyContent={() => (
        <>
          <MaterialSymbol which="communication" />
        </>
      )}
    />
  );
};

const NumberCardBack = () => {
  // NOTE The greater than and less than indicators are opposite the front
  //      because when fanned out, the back will appear in reverse order
  return (
    <StandardCard
      classList="card-back card-number"
      HeaderContent={() => (
        <>
          <span>?</span>
        </>
      )}
      FooterContent={() => (
        <>
          <span>?</span>
        </>
      )}
      BodyContent={() => (
        <>
          <span>#</span>
        </>
      )}
    />
  );
};

// As we add all the card fronts to a list, take counts of how many are in each
// category, so that we can put that same number of card backs onto the page
const CardFronts: Array<JSX.Element> = [];
let lastCardFrontsLength = CardFronts.length;
CardFronts.push(
  ...arrayFrom1ToN(NUM_OF_NUM_CARDS).map((n) => <NumberCard num={n} />),
);
/* CardFronts.push(<SaboteurCard />); */
const numNumCards = CardFronts.length - lastCardFrontsLength;
lastCardFrontsLength = CardFronts.length;

CardFronts.push(...communicationMethods.map(CommunicationMethodCard));
const numCommunicationCards = CardFronts.length - lastCardFrontsLength;
lastCardFrontsLength = CardFronts.length;

CardFronts.push(<KeyCard />);
CardFronts.push(<RulesCard1 />);
CardFronts.push(<RulesCard2 />);
CardFronts.push(<RulesCard3 />);
CardFronts.push(<RulesCard4 />);
const numInfoCards = CardFronts.length - lastCardFrontsLength;
lastCardFrontsLength = CardFronts.length;

const numNonblankCards = CardFronts.length;

// Given N is the total number of non-blank cards, add a number of blank cards to
//   1. Fill up the rest of the last sheet of non-blank cards
//        (NUM_CARDS_PER_PAGE - (N % NUM_CARDS_PER_PAGE))
//   2. Fill up another sheet of all blank cards (+ NUM_CARDS_PER_PAGE)
const numBlankCards =
  NUM_CARDS_PER_PAGE -
  (numNonblankCards % NUM_CARDS_PER_PAGE) +
  NUM_CARDS_PER_PAGE;
CardFronts.push(
  ...Array(numBlankCards).fill(<CommunicationMethodCard main={""} />),
);

const CardBacks: Array<JSX.Element> = [];
CardBacks.push(...Array(numNumCards).fill(<NumberCardBack />));
CardBacks.push(
  ...Array(numCommunicationCards).fill(<CommunicationMethodCardBack />),
);
CardBacks.push(...Array(numInfoCards).fill(<InformationCardBack />));
CardBacks.push(...Array(numBlankCards).fill(<CommunicationMethodCardBack />));
if (CardBacks.length !== CardFronts.length)
  throw new Error(
    `# of card fronts (${CardFronts.length}) did not match # backs (${CardBacks.length})`,
  );

// Now intersperse card backs. After every NUM_CARDS_PER_PAGE card fronts,
// insert NUM_CARDS_PER_PAGE card backs.
const CardFrontsAndBacks: Array<JSX.Element> = [];
for (var i = 0; i < CardFronts.length; i += NUM_CARDS_PER_PAGE) {
  for (var j = i; j < i + NUM_CARDS_PER_PAGE; j++) {
    const card = CardFronts[j];
    if (!card) throw new Error("CardFronts underflowed");
    CardFrontsAndBacks.push(card);
  }

  // Each row of card backs must be in reverse order from the card fronts so
  // that they match up when back-to-back how a printer prints them. So go
  // row by row
  for (let j = i; j < i + NUM_CARDS_PER_PAGE; j += NUM_ROWS_PER_PAGE) {
    // And then column by column, but in reverse order
    // TODO I think a good way to test this logic would be to try a page of
    //      number cards on both the front and the back and make sure they exactly match
    //      up
    for (let k = j + NUM_COLS_PER_PAGE - 1; k >= j; k--) {
      const card = CardBacks[k];
      if (!card) throw new Error("CardBacks underflowed");
      CardFrontsAndBacks.push(card);
    }
  }
}

console.log(
  [
    `Rendered ${CardFronts.length} total cards (${CardFrontsAndBacks.length} fronts and backs)`,
    `${numInfoCards} Info cards (rules and key)`,
    `${numNumCards} Number cards (expected ${NUM_OF_NUM_CARDS} + maybe 1 Saboteur)`,
    `${numCommunicationCards} Directives`,
    `${numBlankCards} blank Directives (so ${
      CardFronts.length - numBlankCards
    } non-blanks)`,
  ].join("\n"),
);
if (CardFrontsAndBacks.length !== 2 * CardFronts.length)
  throw new Error("CardFrontsAndBacks length mismatch");

export const Body = () => (
  <div class="container">
    <script type="text/javascript">
      {`
console.log(
  [
  'Rendered ${CardFronts.length} total cards (${
    CardFrontsAndBacks.length
  } fronts and backs)',
  '${numInfoCards} Info cards (rules and key)',
  '${numNumCards} Number cards (expected ${NUM_OF_NUM_CARDS} + maybe 1 Saboteur)',
  '${numCommunicationCards} Directives',
  '${numBlankCards} blank Directives (so ${
    CardFronts.length - numBlankCards
  } non-blanks)',
 ].join("\\n")
);
`}
    </script>
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
      /* * {
        border: 1px solid red;
      } */
      .material-symbols-outlined {
        font-variation-settings:
          "FILL" 0,
          "wght" 400,
          "GRAD" 0,
          "opsz" 24;
        font-size: inherit;
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
        --poker-card-height: calc(3.5in - (1in / 16));
        --poker-card-width: calc(2.5in - (1in / 32));
        /* https://themagiccafe.com/forums/viewtopic.php?topic=382099 */
        --poker-card-corner-radius: 0.125in;
        --card-height: var(--poker-card-height);
        --card-width: var(--poker-card-width);
        /* empirical, want the inner corner to appear at the center of the curve */
        --card-padding-y: 0.15in;
        --card-padding-x: 0.12in;
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

      .card__container:nth-of-type(${NUM_CARDS_PER_PAGE}n) {
        break-after: page;
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

        border-radius: calc(var(--card-corner-radius) * 0.5);
      }

      /* The border on the backs of the cards is white to account for the
         normal deviations of a commercial printer - they're bad at lining up
         the back and front of the pages. If the card back border has any color
         on a white page, then when I cut out the card front, there will be
         noticeable white edges on the back. But if the back border is also
         white, then there's no issue!

         Note: the two classes make it a bit more specific than just
               .card-communication for example.
      */
      .card__container.card-back {
        background-color: white;
      }

      .card-back .card {
        color: darkgray;
        font-size: 24pt;
      }
      .card-number.card-back,
      .card-number.card-back .card-header {
        font-size: 28pt;
      }
      .card-back .card__body {
        font-size: 72pt;
      }
      .card-number {
        font-family: var(--fancy-font-family);
        font-size: 72pt;
      }
      .card-number.card-number__saboteur .card__body {
        color: var(--font-color);
        font-size: 20pt;

        /* Same as ".card-communication .card__body" below - make a var? */
        padding-inline: calc(1in / 8);
      }

      .card-number .card-number__order-indicator {
        padding-inline: calc(1in / 16);
        color: darkgray;
      }

      .card-header {
        font-size: 24pt;
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
        font-size: 16pt;
      }
      .card-number.card-number--confusing-orientation .card-header {
        text-decoration: underline;
      }

      .card-communication .card__body {
        padding-inline: calc(1in / 8);
      }

      .card-communication .card {
        background-color: darkgray;
        color: white;
      }

      .card-number .card__body {
        color: darkgray;
      }

      .card-key .card__body {
        font-size: 12pt;
      }
      .card-key .card__body .material-symbols-outlined {
        vertical-align: text-bottom;
      }
      .card-rules .card__body {
        font-size: 10pt;
        line-height: 1.2em;
      }
      .card-rules .card__body p {
        margin: 0.4em;
      }
      .page-break {
        height: 0px;
        width: 0px;
        break-after: page;
      }
    `}</style>
    {...CardFrontsAndBacks}
  </div>
);

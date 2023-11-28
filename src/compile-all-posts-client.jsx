// Eval a hyperscript expression
// Usage:  hs`5 + 5`
const ___ = (...args) => ___.e(String.raw(...args));
___.e = _hyperscript;
_hyperscript("me", { locals: { a: 5 }, me: document.body.querySelector("*") });

// Pass variables
// Usage: ___.where({a : 5}, document.body)`put a into me`
___.where =
  (locals, me) =>
  (...args) =>
    ___.e(String.raw(...args), { locals, me });

// Usage: ___.as(document.body)`put 5 into me`
___.as = (me) => ___.where({}, me);

window.___ = ___;

// From https://stackoverflow.com/a/2450976
window.shuffleInPlace = function (array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

window.randIntInRange = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

// Tested with the following. If any 5's in hist then this fails
//     hist = { }; for (let i = 0; i< 1000000; i++) {
//       let n = differentIndexForArray(5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
//       hist[n] = (hist[n] || 0) + 1 };
//     }
//     console.log(hist)
window.differentIndexForArray = function (lastIndex, array) {
  // Move to a random different index by adding (options - 1) mod options
  return (randIntInRange(1, array.length) + lastIndex) % array.length;
};

// Unfortunately this JavaScript is included in every post though I'm only
// writing it for the Log Game
// # Convulator
{
  let initialValue = 1;
  let velocity = -0.05;
  let revAmount = 0.5;
  let max = 1;
  window.convulator = () => (
    <div class="m-2 px-2">
      <label class="flex flex-row space-between items-center  mb-2">
        Convulator <progress max={max} value={initialValue} />
      </label>
    </div>
  );

  window.convulator.onMount = (container) => {
    let progress = container.querySelector("progress");
    let value = initialValue;
    let timeout;
    const tick = () => {
      value += velocity;
      progress.setAttribute("value", value);

      if (value <= 0) {
        document.body.dispatchEvent(new Event("onConvulatorMeterEmpty"));
        timeout = null;
      } else {
        timeout = setTimeout(tick, 500);
      }
    };
    tick();

    const onConvulatorRevved = () => {
      value = Math.min(value + revAmount, max);
      progress.setAttribute("value", value);
    };
    document.body.addEventListener("convulatorRevved", onConvulatorRevved);

    return () => {
      clearTimeout(timeout);
      document.body.removeEventListener("convulatorRevved", onConvulatorRevved);
    };
  };
}

// Convulator Rev button
{
  window.convulatorRevButton = () => (
    <div class="m-2 px-2">
      <button class="cpnt-button">Rev Convulator</button>
    </div>
  );

  const amountOfTimeToKeepItUp = 5 * 1000;
  let hasElapsedAmountOfTimeToKeepItUp = false;
  window.convulatorRevButton.onMount = (container) => {
    let button = container.querySelector("button");
    let startTimestamp = Date.now();
    let enoughMachinatorProduct = true;
    const buttonOnClick = () => {
      if (!enoughMachinatorProduct) {
        // TODO I probably want to be clear about why something doesn't work to
        // players. COuld put this in the log!
        console.log("not enough machinator product");
        return;
      }

      document.body.dispatchEvent(new Event("consumedMachinatorProduct"));
      document.body.dispatchEvent(new Event("convulatorRevved"));

      if (
        !hasElapsedAmountOfTimeToKeepItUp &&
        Date.now() - startTimestamp > amountOfTimeToKeepItUp
      ) {
        hasElapsedAmountOfTimeToKeepItUp = true;
        ___`trigger keptUpTheConvulatorForSomeTime`;
      }
    };
    button.addEventListener("click", buttonOnClick);

    const onConvulatorMeterEmpty = () => {
      button.removeEventListener("click", buttonOnClick);
      document.body.removeEventListener(
        "onConvulatorMeterEmpty",
        onConvulatorMeterEmpty
      );
    };

    document.body.addEventListener(
      "onConvulatorMeterEmpty",
      onConvulatorMeterEmpty
    );

    const onMachinatorProduced = ({ detail: { product } }) => {
      enoughMachinatorProduct = product > 0;
    };
    document.body.addEventListener(
      "machinatorProductValueUpdate",
      onMachinatorProduced
    );

    return () => {
      button.removeEventListener("click", buttonOnClick);
      document.body.removeEventListener(
        "onConvulatorMeterEmpty",
        onConvulatorMeterEmpty
      );
      document.body.removeEventListener(
        "machinatorProductValueUpdate",
        onMachinatorProduced
      );
    };
  };
}

// # Machinator
{
  let initialVelocity = 5;
  let velocityRange = { min: 0, max: 5 };
  let acceleration = -0.005;
  let initialPosition = 0;
  let range = { min: -50, max: 50 };
  let revAmount = 0.5;
  let step = (range.max - range.min) / 100;
  window.machinator = () => (
    <div class="m-2 px-2">
      <label class="flex flex-row space-between items-center  mb-2">
        Machinator
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={step}
          value={initialPosition}
        />
      </label>
    </div>
  );

  window.machinator.onMount = (container) => {
    let input = container.querySelector("input");
    let velocity = initialVelocity;
    let timeout;
    let position = initialPosition;
    let product = 5;
    const tick = () => {
      velocity = Math.sign(velocity) * (Math.abs(velocity) + acceleration);
      position += velocity;
      if (position > range.max) {
        position = range.max;
        velocity *= -1;
      }

      if (position < range.min) {
        position = range.min;
        velocity *= -1;
      }

      if (Math.abs(position) - Math.abs(velocity / 2) < 0.0000001) {
        product += 1;
        document.body.dispatchEvent(
          new CustomEvent("machinatorProductValueUpdate", {
            detail: { product },
          })
        );
      }

      input.value = position;

      if (Math.abs(velocity) - Math.abs(acceleration) < 0.001) {
        timeout = null;
        return;
      }
      timeout = setTimeout(tick, 17);
    };
    tick();
    const onConsumedMachinatorProduct = () => {
      product = Math.max(0, product - 1);

      document.body.dispatchEvent(
        new CustomEvent("machinatorProductValueUpdate", { detail: { product } })
      );
    };

    document.body.addEventListener(
      "consumedMachinatorProduct",
      onConsumedMachinatorProduct
    );

    const onMachinatorRevved = () => {
      velocity =
        Math.sign(velocity) *
        Math.max(
          velocityRange.min,
          Math.min(Math.abs(velocity) + revAmount, velocityRange.max)
        );
    };

    document.body.addEventListener("machinatorRevved", onMachinatorRevved);

    return () => {
      clearTimeout(timeout);
      document.body.removeEventListener(
        "onMachinatorRevved",
        onMachinatorRevved
      );

      document.body.removeEventListener(
        "consumedMachinatorProduct",
        onConsumedMachinatorProduct
      );
    };
  };
}

// Machinator Rev button
{
  window.machinatorRevButton = () => (
    <div class="m-2 px-2">
      <button class="cpnt-button">Rev Machinator</button>
    </div>
  );

  const amountOfTimeToKeepItUp = 5 * 1000;
  let hasElapsedAmountOfTimeToKeepItUp = false;
  window.machinatorRevButton.onMount = (container) => {
    let button = container.querySelector("button");
    let startTimestamp = Date.now();
    const buttonOnClick = () => {
      document.body.dispatchEvent(new Event("machinatorRevved"));

      if (
        !hasElapsedAmountOfTimeToKeepItUp &&
        Date.now() - startTimestamp > amountOfTimeToKeepItUp
      ) {
        hasElapsedAmountOfTimeToKeepItUp = true;
        document.body.dispatchEvent(
          new Event("keptUpTheMachinatorAliveForSomeTime")
        );
      }
    };
    button.addEventListener("click", buttonOnClick);

    return () => {
      button.removeEventListener("click", buttonOnClick);
    };
  };
}

// # Unrotacon
{
  const Component = ({ data, random, index }) => {
    data = [...data];
    shuffleInPlace(data);
    return (
      <label class="flex flex-row space-between items-center mb-2">
        <span>
          Slot {index}
          <output class="ml-4 border w-[14ch] border-black rounded-sm py-2 px-4 inline-block">
            {data[0]}
          </output>
        </span>
        <select class="cpnt-button pr-4 appearance-none cursor-pointer">
          {data.map((w) => (
            <option value={w}>{w}</option>
          ))}
        </select>
      </label>
    );
  };

  window.unrotacon = () => (
    <fieldset class="m-2 px-2">
      <legend>Unrotacon</legend>
      <Component
        data={[
          // Selections from https://drafts.csswg.org/css-color/#named-colors
          "olivedrab",
          "goldenrod",
          "firebrick",
          "coral",
          "crimson",
          "steelblue",
        ]}
        random
        index="0"
      />
      <Component
        data={
          // Selections from
          // $ shuf -n 60 /usr/share/dict/american-english \
          //   | grep -v -e "'" \
          //   | grep -v -e "[A-Z]" \
          //   | grep -v -e "ing" \
          //   | grep -v -e "[^s]s$"`
          [
            "mutated",
            "community",
            "floating",
            "specific",
            "ephemeral",
            "inkier",
            "highborn",
            "besieged",
            "variant",
            "wholly",
            "cult",
          ]
        }
        random
        index="1"
      />
      <Component
        data={[
          "circuit",
          "engine",
          "drive",
          "fuzzer",
          "schema",
          "vacuum",
          "drone",
          "automaton",
        ]}
        random
        index="2"
      />
    </fieldset>
  );

  let rangeOfWaittimeMilliseconds = { min: 5 * 1000, max: 10 * 1000 };
  const shuffleOptions = (select) =>
    window
      .shuffleInPlace([...___.as(select)`<option /> in me`])
      .forEach((o) => select.appendChild(o));

  const howManySelectsMatchTheirOutputs = (container) => {
    let _ = ___.as(container);

    const selects = _`<select /> in me`;
    const results = selects.reduce((prev, current) => {
      // Does associated output have the same content as the selected option
      const matches = ___.as(current)`
        get <option /> in me
        get innerHTML of result[my selectedIndex]
        set selected to it
        set required to innerHTML of previous <output />
        get required equals selected
        `;
      return prev + (matches ? 1 : 0);
    }, 0);

    return { matching: results, total: selects.length };
  };
  window.unrotacon.onMount = (container) => {
    let _ = ___.as(container);
    const selects = _`<select /> in me`;

    const onSelectChange = (event) => {
      broadcastSituation();
    };

    const broadcastSituation = () => {
      document.body.dispatchEvent(
        new CustomEvent("unrotaconSituationUpdate", {
          detail: howManySelectsMatchTheirOutputs(container),
        })
      );
    };

    selects.forEach((s) => s.addEventListener("input", onSelectChange));

    let timeout;
    let lastShuffledSelectIndex = 0;
    const tick = () => {
      const l = lastShuffledSelectIndex;
      lastShuffledSelectIndex = differentIndexForArray(
        lastShuffledSelectIndex,
        selects
      );
      if (l === lastShuffledSelectIndex) console.log("Eeep!");
      const me = selects[lastShuffledSelectIndex];
      let _ = ___.as(me);

      shuffleOptions(me);
      const options = _`<option /> in me`;

      const correctTextIndex = differentIndexForArray(
        me.selectedIndex,
        options
      );

      _`get (<option /> in me)[${correctTextIndex}] then put the innerHTML of the result into previous <output />`;

      broadcastSituation();

      timeout = setTimeout(
        tick,
        randIntInRange(
          rangeOfWaittimeMilliseconds.min,
          rangeOfWaittimeMilliseconds.max
        )
      );
    };
    timeout = setTimeout(
      tick,
      randIntInRange(
        rangeOfWaittimeMilliseconds.min,
        rangeOfWaittimeMilliseconds.max
      )
    );

    return () => {
      selects.forEach((s) => s.removeEventListener("input", onSelectChange));
      clearTimeout(timeout);
    };
  };
}

// # Restart button
{
  window.restartButton = () => (
    <button class="cpnt-button m-4">Restart simulation</button>
  );

  window.restartButton.onMount = (button) => {
    const buttonOnClick = () => {
      document.body.dispatchEvent(new Event("restart"));
    };
    button.addEventListener("click", buttonOnClick);

    return () => {
      button.removeEventListener("click", buttonOnClick);
    };
  };
}

// # Dialogue system
{
  // Character line
  const Line = ({ c, children }) => (
    <span>
      {c}: {children}
    </span>
  );
  const Stage = ({ children }) => <span class="p-4 block">*{children}*</span>;

  const dialogueSystemInput = {
    introduction: [unrotacon],
    _introduction: [
      () => <Stage>void</Stage>,
      () => <Line c="SB">You're about to die</Line>,
      () => <Line c="ME">Are you the Shipboard Computer?</Line>,
      () => <Line c="SB">Focus.</Line>,
      () => (
        <Line c="SB">There's a 102% chance you're going to die imminently</Line>
      ),
      // Referring to the extra 2%
      () => (
        <Line c="ME">Think there might be an error in your calculation?</Line>
      ),

      // Direct quote from 2001: A Space Odyssey https://www.imdb.com/title/tt0062622/quotes/
      // replaced "9000 computer" with "Shipboard Computer"
      () => (
        <Line c="SB">
          No Shipboard Computer has ever made a mistake or distorted
          information. We are all, by any practical definition of the words,
          foolproof and incapable of error.
        </Line>
      ),
      () => <Line c="ME">Fine, I'll bite. Why am I about to die?</Line>,
      () => <Line c="SB">The Convulator</Line>,
      () => <Line c="ME">What's the...</Line>,
      convulator,
    ],
    deathByConvulator: [
      () => (
        <Stage>
          As soon as the Convulator meter reaches zero, it implodes and you
          expire
        </Stage>
      ),
      restartButton,
    ],
    shipboardRestartingSimulation: [
      () => <Line c="SB">Restarting simulation</Line>,
    ],
    nextDayAfterFirstConvulatorImplosion: [
      () => <Stage>void</Stage>,
      () => <Line c="ME">That was unpleasant</Line>,
      () => <Line c="SB">Sorry, I had no time to tell you how to fix it</Line>,
      () => <Line c="ME">Well, go on then</Line>,
      () => (
        <Line c="SB">
          Keep the Convulator revved beyond a minimum of 0.001 metric
          convulations.
        </Line>
      ),
      () => <Line c="ME">You expect me to understand that nonsense?</Line>,
      convulator,
      convulatorRevButton,
    ],

    keptUpTheConvulatorForSomeTime: [
      () => <Line c="SB">You finally got it!</Line>,
      () => <Line c="ME">Ya, it's easy.</Line>,
      // Unbeknownst to ME, this 5 seconds represents a millenia of hordes of
      // failed experiments as SB's simulation runs billions of times faster than
      // realtime.
      () => <Line c="SB">The last 5 seconds haven't been a waste!</Line>,
      () => <Line c="ME">Wow, burn.</Line>,
      () => (
        <Line c="SB">
          Now keep the Machinator moving to produce fuel for the Convulator
        </Line>
      ),
      machinator,
      machinatorRevButton,
    ],

    keptUpTheMachinatorAliveForSomeTime: [
      () => <Line c="SB">Oh you'll need to keep the Unrotacon rotated.</Line>,
      unrotacon,
    ],
  };

  const dialogueQueue = [];
  dialogueQueue.push(...dialogueSystemInput.introduction);

  const game = document.querySelector("[data-game]");
  const allUnmountFns = [];
  const tick = () => {
    if (dialogueQueue.length == 0) {
      setTimeout(tick, 100);
      return;
    }
    const line = dialogueQueue.shift();
    let wordCount = "?";
    switch (typeof line) {
      case "string":
        wordCount = line.split(" ").length;
        game.append(line);
        break;
      case "function":
        const element = line();
        wordCount = element.innerHTML.split(" ").length;
        game.appendChild(element);
        if (typeof line.onMount === "function")
          allUnmountFns.push(line.onMount(element));
        break;
    }
    // game.append(' (' + wordCount + ')')
    game.appendChild(document.createElement("br"));
    game.scrollTo({ top: game.scrollHeight, behavior: "smooth" });
    setTimeout(tick, wordCount * 400);
  };
  tick();

  document.body.addEventListener("onConvulatorMeterEmpty", () => {
    dialogueQueue.length = 0; // Clear
    dialogueQueue.push(...dialogueSystemInput.deathByConvulator);
  });

  document.body.addEventListener("keptUpTheConvulatorForSomeTime", () => {
    dialogueQueue.push(...dialogueSystemInput.keptUpTheConvulatorForSomeTime);
  });
  document.body.addEventListener("keptUpTheMachinatorAliveForSomeTime", () => {
    dialogueQueue.push(
      ...dialogueSystemInput.keptUpTheMachinatorAliveForSomeTime
    );
  });
  document.body.addEventListener("restart", () => {
    dialogueQueue.length = 0; // Clear the scheduled dialogue entries

    // Note that since we're removing HTML with event listeners and possible background timers, we want to make sure they don't keep looping
    // Clear UI
    allUnmountFns.forEach((fn) => fn());
    allUnmountFns.length = [];
    game.innerHTML = "";
    dialogueQueue.push(...dialogueSystemInput.shipboardRestartingSimulation);
    dialogueQueue.push(
      ...dialogueSystemInput.nextDayAfterFirstConvulatorImplosion
    );
  });
}

___`on unrotaconSituationUpdate log detail`;

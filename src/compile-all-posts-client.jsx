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

  let startTimestamp;
  const amountOfTimeToKeepItUp = 5 * 1000;
  let hasElapsedAmountOfTimeToKeepItUp = false;
  window.convulatorRevButton.onMount = (container) => {
    let button = container.querySelector("button");
    let enoughMachinatorProduct = true;
    const buttonOnClick = () => {
      if (!enoughMachinatorProduct) {
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
        document.body.dispatchEvent(
          new Event("keptUpTheConvulatorForSomeTime")
        );
      }
    };
    button.addEventListener("click", buttonOnClick);
    startTimestamp = Date.now();

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
      console.log({ product });
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
      startTimestamp = null;
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

  window.machinatorRevButton.onMount = (container) => {
    let button = container.querySelector("button");
    const buttonOnClick = () => {
      document.body.dispatchEvent(new Event("machinatorRevved"));
    };
    button.addEventListener("click", buttonOnClick);

    return () => {
      button.removeEventListener("click", buttonOnClick);
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
    introduction: [
      () => <Stage>void</Stage>,
      () => <Line c="SB (Shipboard computer)">You're about to die</Line>,
      () => <Line c="ME">Okay... lol</Line>,
      () => (
        <Line c="SB">There's a 101% chance you're going to die imminently</Line>
      ),
      () => <Line c="ME">Well, why?</Line>,
      () => <Line c="SB">Because you didn't know about The Convulator</Line>,
      () => <Line c="ME">What's the...</Line>,
      convulator,
    ],
    nextDayAfterFirstConvulatorImplosion: [
      () => <Stage>void</Stage>,
      () => <Line c="ME">What the actual...</Line>,
      () => <Line c="SB">Sorry, I forgot to tell you how to survive.</Line>,
      () => <Line c="ME">How do I survive? Please help!</Line>,
      () => <Line c="SB">You have to keep the Convulator Revved</Line>,
      () => <Line c="ME">And you expect me to just know how to do that?</Line>,
      convulator,
      convulatorRevButton,
    ],

    keptUpTheConvulatorForSomeTime: [
      () => <Line c="SB">You finally got it!</Line>,
      () => <Line c="ME">It's easy...</Line>,
      () => (
        <Line c="SB">
          The pile of failed experiments in your past might disagree.
        </Line>
      ),
      () => <Line c="SB">But anyway, progress is progress</Line>,
      () => (
        <Line c="SB">
          Oh, you'll need to keep your Machinator running to produce fuel for
          the Convulator
        </Line>
      ),
      machinator,
      machinatorRevButton,
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

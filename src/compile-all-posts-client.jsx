// Unfortunately this JavaScript is included in every post though I'm only
// writing it for the Log Game
// # Convulator
{
  let initialValue = 1;
  let velocity = -0.1;
  let revAmount = 0.5;
  let max = 1;
  window.convulator = () => (
    <div class="m-2 px-2">
      <label class="block mb-2">
        Convulator:<progress max={max} value={initialValue}></progress>
      </label>
      <button class="cpnt-button">Rev Convulator</button>
    </div>
  );

  window.convulator.onMount = (container) => {
    let progress = container.querySelector("progress");
    let button = container.querySelector("button");
    let value = initialValue;
    let timeout;
    const tick = () => {
      value += velocity;
      progress.setAttribute("value", value);

      if (value <= 0) {
        document.body.dispatchEvent(new Event("shipExploded"));
        timeout = null;
      } else {
        timeout = setTimeout(tick, 500);
      }
    };
    tick();

    const buttonOnClick = () => {
      value = Math.min(value + revAmount, max);
      progress.setAttribute("value", value);
    };
    button.addEventListener("click", buttonOnClick);

    return () => {
      clearTimeout(timeout);
      button.removeEventListener("click", buttonOnClick);
    };
  };
}

// # Dialoge system
{
  const dialogueIntroduction = [
    "<Setting: Complete darkness, a voice pierces an otherwise sensory-deprived blank moment>",
    "SB (Shipboard computer): You're about to die",
    "ME: What?!",
    "SB: There's a 100% chance you're going to die imminently",
    "ME: Why?!",
    "SB: Riveting conversationalist...",
    "SB: Because you didn't know you had to Rev The Convulator until now",
    "ME: What's the...",
    convulator,
  ];

  const dialogueWhenShipExplodes = [
    "<The ship explodes and the entire crew expires in an instant>",
  ];

  const dialogueQueue = [];

  dialogueQueue.push(...dialogueIntroduction);

  const game = document.querySelector("[data-game]");
  let dialogueTickTimerId;
  const tick = () => {
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
        if (typeof line.onMount === "function") line.onMount(element);
    }
    // game.append(' (' + wordCount + ')')
    if (dialogueQueue.length === 0) {
      dialogueTickTimerId = null;
      return;
    }
    game.appendChild(document.createElement("br"));
    dialogueTickTimerId = setTimeout(tick, wordCount * 400);
  };
  tick();

  document.body.addEventListener("shipExploded", () => {
    dialogueQueue.length = 0; // Clear
    dialogueQueue.push(...dialogueWhenShipExplodes);
    // Note that since we're using dialogueTickTimerId to track whether the
    // dialogue engine is running, we must always clear it when it stops
    if (!dialogueTickTimerId) tick();
  });
}

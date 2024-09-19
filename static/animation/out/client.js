// emacs-colors.json
var background = "#6A6483";

// utilities.ts
var { PI, cos, sin, sqrt, atan2, abs, floor, min, max, random } = Math;
var TAO = PI * 2;
var PHI = 1.618033988749895;
var lerp = (v0, v1, t) => v0 + t * (v1 - v0);
var circularLerp = (v0, v1, t) => {
  const shortestAngle = (v1 - v0 + PI) % TAO - PI;
  return lerp(v0, v0 + shortestAngle, t);
};
var forEachCurrentAndLast = (g, callback) => {
  for (let index = 1;index < g.length; index++) {
    let last = g[index - 1];
    let current = g[index];
    callback({ current, last, index });
  }
};
var generateArray = (n, callback) => Array(n).fill(null).map((_, index) => {
  return callback({ index, fraction: index / n });
});

// client.ts
var setCanvasDimensions = function() {
  let clientRect = canvas.getBoundingClientRect();
  d = {
    width: clientRect.width,
    height: clientRect.height,
    center: {
      x: clientRect.width / 2,
      y: clientRect.height / 2
    }
  };
  canvas.width = d.width;
  canvas.height = d.height;
  setup();
};
var circle = function({ x, y, radius }) {
  c.beginPath();
  c.arc(x, y, radius, 0, TAO, true);
  c.fill();
};
var setup = function() {
  c.fillStyle = background;
  c.fillRect(0, 0, d.width, d.height);
  const numSegments = 40;
  const radius = d.width / numSegments / 3 - 1;
  snake = generateArray(numSegments, ({ index }) => ({
    x: 40 + d.width / numSegments * index + radius + 1,
    y: d.center.y,
    radius
  }));
  const numAppendages = 16;
  heads = generateArray(numAppendages, ({ fraction }) => ({
    x: fraction * random() * d.width,
    y: fraction * random() * d.height,
    radius: radius * PHI,
    direction: TAO * random()
  }));
  appendages = generateArray(numAppendages, () => generateArray(40, ({ fraction }) => ({
    top: {
      x: fraction * d.width,
      y: fraction * d.height
    },
    bottom: {
      x: fraction * d.width + 10,
      y: fraction * d.height + 0
    }
  })));
};
var draw = function() {
  c.fillStyle = `hsla(${i++ % 360}, 50%, 50%, 0.005)`;
  c.fillRect(0, 0, d.width, d.height);
  c.strokeStyle = "white";
  c.fillStyle = "white";
  heads.forEach((head) => {
    const prevHead = { ...head };
    let nextDirection = head.direction;
    if (controllingWithMouse) {
      head.x = mouseX ?? head.x;
      head.y = mouseY ?? head.y;
      if (abs(head.x - prevHead.x) > 0.0001 && abs(head.y - prevHead.y) > 0.0001) {
        nextDirection = atan2(head.y - prevHead.y, head.x - prevHead.x);
        head.direction = circularLerp(head.direction, nextDirection, 0.6);
      }
    } else {
      const wayOut = -80;
      const margin = 40;
      if (d.width - head.x < wayOut || d.height - head.y < wayOut || head.x < wayOut || head.y < wayOut) {
        head.x = d.center.x;
        head.y = d.center.y;
        nextDirection = Math.random() * TAO;
        head.direction = nextDirection;
      } else if (d.width - head.x < margin || d.height - head.y < margin || head.x < margin || head.y < margin) {
        nextDirection = atan2(d.center.y - head.y, d.center.x - head.x);
      }
      head.direction = circularLerp(head.direction, nextDirection, 0.02);
      const speed = 2;
      head.x += cos(head.direction) * speed;
      head.y += sin(head.direction) * speed;
    }
  });
  followPoint(snake.at(0), heads[0], 0.07);
  forEachCurrentAndLast(snake, ({ last: last2, current, index: i }) => {
    constrainDistance(last2, current, last2.radius + current.radius, SEGMENT_SPREAD);
  });
  let skinPoints = [];
  const first = snake.at(0);
  const directionToHead = atan2(heads[0].y - first.y, heads[0].x - first.x);
  const increment = TAO / 16;
  const cheekCount = 5;
  for (let i = 0;i < cheekCount; i++) {
    const angle = directionToHead + increment * (i - cheekCount);
    skinPoints.push({
      x: first.x + cos(angle) * first.radius,
      y: first.y + sin(angle) * first.radius
    });
  }
  skinPoints.push({
    x: first.x + cos(directionToHead) * first.radius * PHI,
    y: first.y + sin(directionToHead) * first.radius * PHI
  });
  for (let i = 1;i <= cheekCount; i++) {
    const angle = directionToHead + increment * i;
    skinPoints.push({
      x: first.x + cos(angle) * first.radius,
      y: first.y + sin(angle) * first.radius
    });
  }
  forEachCurrentAndLast(snake, ({ current, last: last2, index }) => {
    if (index === snake.length - 1)
      return;
    const direction = atan2(last2.y - current.y, last2.x - current.x);
    const increment2 = TAO / 8;
    skinPoints.push({
      x: current.x + cos(direction + increment2 * 1) * current.radius,
      y: current.y + sin(direction + increment2 * 1) * current.radius
    }, {
      x: current.x + cos(direction + increment2 * 2) * current.radius,
      y: current.y + sin(direction + increment2 * 2) * current.radius
    }, {
      x: current.x + cos(direction + increment2 * 3) * current.radius,
      y: current.y + sin(direction + increment2 * 3) * current.radius
    });
    skinPoints.unshift({
      x: current.x + cos(direction - increment2 * 1) * current.radius,
      y: current.y + sin(direction - increment2 * 1) * current.radius
    }, {
      x: current.x + cos(direction - increment2 * 2) * current.radius,
      y: current.y + sin(direction - increment2 * 2) * current.radius
    }, {
      x: current.x + cos(direction - increment2 * 3) * current.radius,
      y: current.y + sin(direction - increment2 * 3) * current.radius
    });
  });
  let secondToLast = snake.at(-2);
  let last = snake.at(-1);
  const lastDirection = atan2(secondToLast.y - last.y, secondToLast.x - last.x);
  for (let i = lastDirection + PI - 5 * increment;i < lastDirection + PI + 6 * increment; i += increment) {
    skinPoints.push({
      x: last.x + cos(i) * last.radius,
      y: last.y + sin(i) * last.radius
    });
  }
  if (SHOW_HEADS) {
    heads.forEach((head) => {
      c.fillStyle = "rgba(255, 255, 255, 0.2)";
      circle({ ...head });
      c.strokeStyle = "tomato";
      c.lineWidth = 3;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(head.x, head.y);
      c.lineTo(head.x + cos(head.direction) * PHI * head.radius, head.y + sin(head.direction) * PHI * head.radius);
      c.stroke();
    });
  }
  if (SHOW_SEGMENTS) {
    snake.forEach(({ x, y, radius }) => {
      c.fillStyle = `rgba(170, 156, 40, 0.8)`;
      circle({ x, y, radius });
    });
  }
  if (SHOW_SKIN_POINTS) {
    skinPoints.forEach(({ x, y }) => {
      c.fillStyle = `rgba(40, 156, 170, 0.8)`;
      circle({ x, y, radius: 5 });
    });
  }
  if (SHOW_SKIN) {
    const now = Date.now();
    forEachCurrentAndLast(skinPoints, ({ current, last: last2, index }) => {
      const i = index / skinPoints.length;
      const t = (cos(TAO * now / 2000) + 1) / 2;
      c.beginPath();
      c.moveTo(last2.x, last2.y);
      c.strokeStyle = `rgba(${floor(i * 255)}, ${floor(t * 255)}, ${floor(floor(255 - i * 255))}, 1)`;
      c.lineTo(current.x, current.y);
      c.stroke();
    });
    {
      const last2 = skinPoints.at(-1);
      const first2 = skinPoints.at(0);
      c.beginPath();
      c.moveTo(last2.x, last2.y);
      c.lineTo(first2.x, first2.y);
      c.stroke();
      c.closePath();
    }
  }
  for (let k = 0;k < appendages.length; k++) {
    bones = appendages[k];
    for (let j = 0;j < 10; j++) {
      const firstBone = bones[0];
      followPoint(firstBone.top, {
        x: heads[k].x,
        y: heads[k].y
      }, 0.07);
      constrainDistance(firstBone.top, firstBone.bottom, 0);
      forEachCurrentAndLast(bones, ({ last: last2, current }) => {
        const originalBoneLength = distance(current.bottom, current.top);
        constrainDistance(last2.bottom, current.top, BONE_SPREAD);
        constrainDistance(current.top, current.bottom, originalBoneLength, 1);
      });
      const lastBone = bones.at(-1);
      lastBone.bottom.x = d.width / 2;
      lastBone.bottom.y = d.height / 2;
      followPoint(lastBone.top, lastBone.bottom, 0.2);
      forEachCurrentAndLast(bones.toReversed(), ({ current, last: last2 }) => {
        const originalBoneLength = distance(current.top, current.bottom);
        constrainDistance(last2.top, current.bottom, BONE_SPREAD);
        constrainDistance(current.bottom, current.top, originalBoneLength);
      });
    }
    for (let i = 0;i < bones.length; i++) {
      const { top, bottom } = bones[i];
      c.beginPath();
      c.moveTo(top.x, top.y);
      c.strokeStyle = "black";
      c.fillStyle = c.strokeStyle;
      c.lineWidth = min(i / PHI, 5);
      c.lineTo(bottom.x, bottom.y);
      c.stroke();
    }
  }
  circle({ x: d.width / 2, y: d.height / 2, radius: 10 });
  requestAnimationFrame(draw);
};
var SHOW_HEADS = false;
var SEGMENT_SPREAD = 0.3;
var SHOW_SEGMENTS = false;
var SHOW_SKIN_POINTS = false;
var SHOW_SKIN = false;
var BONE_SPREAD = 0;
var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");
var d;
var constrainDistance = (anchor, mover, distance, spread = 1) => {
  const adjacent = anchor.x - mover.x;
  const other = anchor.y - mover.y;
  const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
  const angle = atan2(other, adjacent);
  const moveDistance = hypoteneuse - distance * spread;
  mover.x += cos(angle) * moveDistance;
  mover.y += sin(angle) * moveDistance;
};
var followPoint = (first, other, factor) => {
  first.x = lerp(first.x, other.x, factor);
  first.y = lerp(first.y, other.y, factor);
};
var distance = (first, second) => {
  const adjacent = first.x - second.x;
  const other = first.y - second.y;
  return sqrt(adjacent ** 2 + other ** 2);
};
var snake;
var mouseX;
var mouseY;
var controllingWithMouse = false;
var heads;
var bones;
var appendages;
var i = 0;
canvas.addEventListener("mousemove", ({ clientX, clientY }) => {
  mouseX = clientX;
  mouseY = clientY;
});
canvas.addEventListener("touchmove", ({ touches }) => {
  const { clientX, clientY } = touches[0];
  mouseX = clientX;
  mouseY = clientY;
});
canvas.addEventListener("mouseup", () => {
  controllingWithMouse = !controllingWithMouse;
  if (!controllingWithMouse) {
    heads.forEach((head) => {
      head.direction = TAO * random();
    });
  }
});
canvas.addEventListener("mousedown", () => {
});
document.body.addEventListener("keydown", (event) => {
  const { key } = event;
  if (key == "r") {
    c.fillStyle = "#282828";
    c.fillRect(0, 0, d.width, d.height);
  }
});
window.addEventListener("resize", () => {
  setCanvasDimensions();
});
setCanvasDimensions();
draw();

// emacs-colors.json
var foreground = "#FFB8D1";
var background = "#5a5475";

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
  numSegments = 40;
  const radius = d.width / numSegments / 3 - 1;
  segments = Array(numSegments).fill(null).map((_, i) => ({
    x: 40 + d.width / numSegments * i + radius + 1,
    y: d.center.y,
    radius
  }));
  head = {
    x: segments[0].x,
    y: segments[0].y,
    radius: radius * PHI,
    direction: TAO / -8
  };
};
var draw = function() {
  c.fillStyle = background;
  c.fillRect(0, 0, d.width, d.height);
  c.strokeStyle = "white";
  c.fillStyle = "white";
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
  const first = segments[0];
  first.x = lerp(first.x, head.x, 0.07);
  first.y = lerp(first.y, head.y, 0.07);
  for (let i = 1;i < segments.length; i++) {
    let last2 = segments[i - 1];
    let current = segments[i];
    const adjacent = last2.x - current.x;
    const other = last2.y - current.y;
    const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
    const angle = atan2(other, adjacent);
    const moveDistance = hypoteneuse - (last2.radius + current.radius) * segmentSpread;
    current.x += cos(angle) * moveDistance;
    current.y += sin(angle) * moveDistance;
  }
  let skinPoints = [];
  const directionToHead = atan2(head.y - first.y, head.x - first.x);
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
  for (let i = 1;i < segments.length - 1; i++) {
    let last2 = segments[i - 1];
    let current = segments[i];
    const direction = atan2(last2.y - current.y, last2.x - current.x);
    const increment2 = TAO / 8;
    skinPoints.push({
      x: current.x + cos(direction + increment2 * 1) * current.radius,
      y: current.y + sin(direction + increment2 * 1) * current.radius
    });
    skinPoints.push({
      x: current.x + cos(direction + increment2 * 2) * current.radius,
      y: current.y + sin(direction + increment2 * 2) * current.radius
    });
    skinPoints.push({
      x: current.x + cos(direction + increment2 * 3) * current.radius,
      y: current.y + sin(direction + increment2 * 3) * current.radius
    });
    skinPoints.unshift({
      x: current.x + cos(direction - increment2 * 1) * current.radius,
      y: current.y + sin(direction - increment2 * 1) * current.radius
    });
    skinPoints.unshift({
      x: current.x + cos(direction - increment2 * 2) * current.radius,
      y: current.y + sin(direction - increment2 * 2) * current.radius
    });
    skinPoints.unshift({
      x: current.x + cos(direction - increment2 * 3) * current.radius,
      y: current.y + sin(direction - increment2 * 3) * current.radius
    });
  }
  let secondToLast = segments.at(-2);
  let last = segments.at(-1);
  const lastDirection = atan2(secondToLast.y - last.y, secondToLast.x - last.x);
  for (let i = lastDirection + PI - 5 * increment;i < lastDirection + PI + 6 * increment; i += increment) {
    skinPoints.push({
      x: last.x + cos(i) * last.radius,
      y: last.y + sin(i) * last.radius
    });
  }
  if (SHOW_HEAD) {
    c.fillStyle = "rgba(255, 255, 255, 0.2)";
    circle({ ...head });
    c.strokeStyle = "tomato";
    c.lineWidth = 3;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(head.x, head.y);
    c.lineTo(head.x + cos(head.direction) * PHI * head.radius, head.y + sin(head.direction) * PHI * head.radius);
    c.stroke();
  }
  if (SHOW_SEGMENTS) {
    segments.forEach(({ x, y, radius }, index) => {
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
    for (let index = 1;index < skinPoints.length; index++) {
      const last2 = skinPoints[index - 1];
      const current = skinPoints[index];
      const i = index / skinPoints.length;
      const t = (cos(TAO * now / 2000) + 1) / 2;
      c.beginPath();
      c.moveTo(last2.x, last2.y);
      c.strokeStyle = foreground;
      c.lineTo(current.x, current.y);
      c.stroke();
    }
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
  requestAnimationFrame(draw);
};
var SHOW_HEAD = true;
var segmentSpread = 1;
var SHOW_SEGMENTS = true;
var SHOW_SKIN_POINTS = false;
var SHOW_SKIN = false;
var { PI, cos, sin, sqrt, atan2, abs, min, floor } = Math;
var TAO = PI * 2;
var PHI = 1.618033988749895;
var lerp = (v0, v1, t) => v0 + t * (v1 - v0);
var circularLerp = (v0, v1, t) => {
  const shortestAngle = (v1 - v0 + PI) % TAO - PI;
  return lerp(v0, v0 + shortestAngle, t);
};
var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");
var d;
var numSegments;
var segments;
var mouseX;
var mouseY;
var controllingWithMouse = false;
var head;
canvas.addEventListener("mousemove", ({ clientX, clientY }) => {
  mouseX = clientX;
  mouseY = clientY;
});
canvas.addEventListener("touchmove", ({ touches }) => {
  const { clientX, clientY } = touches[0];
  mouseX = clientX;
  mouseY = clientY;
});
canvas.addEventListener("mouseup", ({ clientX, clientY }) => {
  controllingWithMouse = !controllingWithMouse;
});
canvas.addEventListener("mousedown", ({ clientX, clientY }) => {
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

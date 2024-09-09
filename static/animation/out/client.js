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
  c.fillStyle = "#282828";
  c.fillRect(0, 0, d.width, d.height);
  numSegments = 180;
  const radius = d.width / numSegments / 1 - 1;
  segments = Array(numSegments).fill(null).map((_, i) => ({
    x: d.width / numSegments * i + radius + 1,
    y: d.center.y,
    radius
  }));
  head = {
    x: segments[0].x,
    y: segments[0].y,
    radius: radius * 4,
    direction: 0
  };
};
var draw = function() {
  c.fillStyle = "rgba(100, 100, 100, 0.001)";
  c.fillRect(0, 0, d.width, d.height);
  c.strokeStyle = "white";
  c.fillStyle = "white";
  const prevHead = { ...head };
  let nextDirection = head.direction;
  if (controllingWithMouse) {
    if (abs(head.x - prevHead.x) > 0.0001 && abs(head.y - prevHead.y) > 0.0001) {
      nextDirection = atan2(head.y - prevHead.y, head.x - prevHead.x);
    }
  } else {
    const wayOut = -50;
    const margin = -10;
    if (d.width - head.x < wayOut || d.height - head.y < wayOut || head.x < wayOut || head.y < wayOut) {
      head.x = d.center.x;
      head.y = d.center.y;
      nextDirection = Math.random() * TAO;
      head.direction = nextDirection;
    } else if (d.width - head.x < margin || d.height - head.y < margin || head.x < margin || head.y < margin) {
      nextDirection = atan2(d.center.y - head.y, d.center.x - head.x);
    }
  }
  head.direction = lerp(normalizeAngle(head.direction) + TAO, normalizeAngle(nextDirection) + TAO, 0.1) % TAO;
  if (controllingWithMouse) {
    head.x = mouseX ?? head.x;
    head.y = mouseY ?? head.y;
  } else {
    const speed = 8;
    head.x += cos(head.direction) * speed;
    head.y += sin(head.direction) * speed;
  }
  const first = segments[0];
  first.x = lerp(first.x, head.x, 0.07);
  first.y = lerp(first.y, head.y, 0.07);
  for (let i = 1;i < segments.length; i++) {
    let last = segments[i - 1];
    let current = segments[i];
    const adjacent = last.x - current.x;
    const other = last.y - current.y;
    const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
    const angle = atan2(other, adjacent);
    const moveDistance = hypoteneuse - (last.radius + current.radius) * 0.38;
    current.x += cos(angle) * moveDistance;
    current.y += sin(angle) * moveDistance;
  }
  let skinPoints;
  for (let i = 1;i < segments.length; i++) {
    let last = segments[i - 1];
    let current = segments[i];
  }
  segments.forEach(({ x, y, radius }, index) => {
    c.fillStyle = `rgba(${255 - cos(TAO * index / numSegments) * 255}, ${cos(TAO * Date.now() / 1000) / 2 * 255}, ${cos(TAO * index / numSegments) * 255}, 0.8)`;
    circle({ x, y, radius });
  });
  requestAnimationFrame(draw);
};
var { PI, cos, sin, sqrt, atan2, abs } = Math;
var TAO = PI * 2;
var lerp = (v0, v1, t) => v0 + t * (v1 - v0);
var normalizeAngle = (angle) => (angle + TAO) % TAO;
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

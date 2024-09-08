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
  c.arc(x, y, radius, 0, PI * 2, true);
  c.stroke();
};
var setup = function() {
  numSegments = 40;
  const radius = d.width / numSegments / 1 - 1;
  segments = Array(numSegments).fill(null).map((_, i) => ({
    x: d.width / numSegments * i + radius + 1,
    y: d.center.y,
    radius
  }));
};
var draw = function() {
  c.fillStyle = "#282828";
  c.fillRect(0, 0, d.width, d.height);
  c.strokeStyle = "white";
  c.fillStyle = "white";
  const head = segments[0];
  head.x = mouseX ?? d.center.x;
  head.y = mouseY ?? d.center.y;
  for (let i = 1;i < segments.length; i++) {
    let last = segments[i - 1];
    let current = segments[i];
    const adjacent = last.x - current.x;
    const other = last.y - current.y;
    const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
    const angle = atan2(other, adjacent);
    const moveDistance = hypoteneuse - (last.radius + current.radius);
    current.x += cos(angle) * moveDistance;
    current.y += sin(angle) * moveDistance;
  }
  segments.forEach(({ x, y, radius }) => {
    circle({ x, y, radius });
  });
  if (drawing)
    circle({ x: mouseX, y: mouseY, radius: 5 });
  requestAnimationFrame(draw);
};
var { PI, cos, sin, sqrt, atan2 } = Math;
var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");
var d;
var numSegments;
var segments;
var mouseX;
var mouseY;
var drawing = false;
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
  drawing = false;
});
canvas.addEventListener("mousedown", ({ clientX, clientY }) => {
  draw();
});
window.addEventListener("resize", () => {
  setCanvasDimensions();
  draw();
});
setCanvasDimensions();
draw();

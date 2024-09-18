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
  numBones = 10;
  boneLength = 40;
  boneSets = [];
  for (let i = 0;i < 10; i++) {
    bones = Array(numBones).fill(null).map((_, i2) => ({
      top: {
        x: i2 / numBones * d.width,
        y: i2 / numBones * d.height
      },
      bottom: {
        x: i2 / numBones * d.width + boneLength,
        y: i2 / numBones * d.height + 0
      }
    }));
    boneSets.push(bones);
  }
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
  for (let k = 0;k < boneSets.length; k++) {
    bones = boneSets[k];
    for (let j = 0;j < 10; j++) {
      const firstBone = bones[0];
      firstBone.top.x = lerp(firstBone.top.x, (head.x + k * 13097) % d.width, 0.07);
      firstBone.top.y = lerp(firstBone.top.y, (head.y + k * 13097) % d.height, 0.07);
      firstBone.bottom.x = lerp(firstBone.top.x, head.x, 0.002);
      firstBone.bottom.y = lerp(firstBone.top.y, head.y, 0.002);
      for (let i = 1;i < bones.length; i++) {
        let lastBone2 = bones[i - 1];
        let currentBone = bones[i];
        let last2 = lastBone2.bottom;
        let currentTop = currentBone.top;
        let currentBottom = currentBone.bottom;
        const originalAdjacent = currentBottom.x - currentTop.x;
        const originalOther = currentBottom.y - currentTop.y;
        const originalBoneLength = sqrt(originalAdjacent ** 2 + originalOther ** 2);
        {
          const adjacent = last2.x - currentTop.x;
          const other = last2.y - currentTop.y;
          const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
          const angle = atan2(other, adjacent);
          const moveDistance = hypoteneuse - 10;
          currentTop.x += cos(angle) * moveDistance;
          currentTop.y += sin(angle) * moveDistance;
        }
        {
          const adjacent = currentBottom.x - currentTop.x;
          const other = currentBottom.y - currentTop.y;
          const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
          const angle = atan2(other, adjacent);
          const moveDistance = originalBoneLength - hypoteneuse;
          currentBottom.x += cos(angle) * moveDistance;
          currentBottom.y += sin(angle) * moveDistance;
        }
      }
      const lastBone = bones.at(-1);
      lastBone.bottom.x = lerp(lastBone.bottom.x, d.width / 2, 0.07);
      lastBone.bottom.y = lerp(lastBone.bottom.y, d.height / 2, 0.07);
      lastBone.top.x = lerp(lastBone.bottom.x, head.x, 0.002);
      lastBone.top.y = lerp(lastBone.bottom.y, head.y, 0.002);
      for (let i = bones.length - 2;i >= 0; i--) {
        let lastBone2 = bones[i + 1];
        let currentBone = bones[i];
        let last2 = lastBone2.top;
        let currentBottom = currentBone.bottom;
        let currentTop = currentBone.top;
        const originalAdjacent = currentTop.x - currentBottom.x;
        const originalOther = currentTop.y - currentBottom.y;
        const originalBoneLength = sqrt(originalAdjacent ** 2 + originalOther ** 2);
        {
          const adjacent = last2.x - currentBottom.x;
          const other = last2.y - currentBottom.y;
          const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
          const angle = atan2(other, adjacent);
          const moveDistance = hypoteneuse - 10;
          currentBottom.x += cos(angle) * moveDistance;
          currentBottom.y += sin(angle) * moveDistance;
        }
        {
          const adjacent = currentTop.x - currentBottom.x;
          const other = currentTop.y - currentBottom.y;
          const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
          const angle = atan2(other, adjacent);
          const moveDistance = originalBoneLength - hypoteneuse;
          currentTop.x += cos(angle) * moveDistance;
          currentTop.y += sin(angle) * moveDistance;
        }
      }
    }
    for (let i = 0;i < bones.length; i++) {
      const { top, bottom } = bones[i];
      c.beginPath();
      c.moveTo(top.x, top.y);
      c.strokeStyle = `rgba(${floor(i * 255)}, 128, ${floor(floor(255 - i * 255))}, 1)`;
      c.fillStyle = c.strokeStyle;
      c.lineWidth = i * PHI;
      c.lineTo(bottom.x, bottom.y);
      c.stroke();
    }
  }
  circle({ x: d.width / 2, y: d.height / 2, radius: 50 });
  requestAnimationFrame(draw);
};
var SHOW_HEAD = false;
var segmentSpread = 0.3;
var SHOW_SEGMENTS = false;
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
var bones;
var boneSets;
var numBones;
var boneLength;
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

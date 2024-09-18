import { foreground, background } from "./emacs-colors.json";
const SHOW_HEAD = false;
const segmentSpread = 0.3;
const SHOW_SEGMENTS = false;
const SHOW_SKIN_POINTS = false;
const SHOW_SKIN = false;
const { PI, cos, sin, sqrt, atan2, abs, min, floor } = Math;
const TAO = PI * 2;
const PHI = 1.618033988749895;
const lerp = (v0: number, v1: number, t: number) => v0 + t * (v1 - v0);
const normalizeAngle = (angle: number) => (angle + TAO) % TAO;
// From https://stackoverflow.com/a/14498790
const circularLerp = (v0: number, v1: number, t: number) => {
    const shortestAngle = ((v1 - v0 + PI) % TAO) - PI;
    // TODO: This still doesn't quite work how I want it to.
    return lerp(v0, v0 + shortestAngle, t);
};

// The unit circle starts pointing directly east, and sweeps south then west
// because Y grows downwards.
const mapDirections = (angle: number) => {
    angle = normalizeAngle(angle);
    if (
        (angle >= (15 * TAO) / 16 && angle <= TAO) ||
        (angle >= 0 && angle <= TAO / 16)
    )
        return "east";
    if (angle >= TAO / 16 && angle <= (3 * TAO) / 16) return "southeast";
    if (angle >= (3 * TAO) / 16 && angle <= (5 * TAO) / 16) return "south";
    if (angle >= (5 * TAO) / 16 && angle <= (7 * TAO) / 16) return "southwest";
    if (angle >= (7 * TAO) / 16 && angle <= (9 * TAO) / 16) return "west";
    if (angle >= (9 * TAO) / 16 && angle <= (11 * TAO) / 16) return "northwest";
    if (angle >= (11 * TAO) / 16 && angle <= (13 * TAO) / 16) return "north";
    if (angle >= (13 * TAO) / 16 && angle <= (15 * TAO) / 16)
        return "northeast";
};
const canvas = document.querySelector("canvas")!;
const c = canvas.getContext("2d")!; // Context
let d: {
    // Dimensions
    width: number;
    height: number;
    center: {
        x: number;
        y: number;
    };
};
function setCanvasDimensions() {
    let clientRect = canvas.getBoundingClientRect();
    d = {
        width: clientRect.width,
        height: clientRect.height,
        center: {
            x: clientRect.width / 2,
            y: clientRect.height / 2,
        },
    };
    canvas.width = d.width;
    canvas.height = d.height;
    setup();
}

type Point = { x: number; y: number };
type Circle = Point & { radius: number };
function circle({ x, y, radius }: Circle) {
    c.beginPath();
    c.arc(x, y, radius, 0, TAO, true);
    c.fill();
}

let numSegments: number;
let segments: Array<Circle>;
let mouseX: number;
let mouseY: number;
let controllingWithMouse = false;
let head: Circle & { direction: number };

type Bone = {
    top: Point;
    bottom: Point;
};
let bones: Array<Bone>;
let boneSets: Array<typeof bones>;
let numBones: number;
let boneLength: number;
function setup() {
    c.fillStyle = background; // TODO Get calculated body font color
    c.fillRect(0, 0, d.width, d.height);
    numSegments = 40;
    const radius = d.width / numSegments / 3 - 1;
    segments = Array(numSegments)
        .fill(null)
        .map((_, i) => ({
            x: 40 + (d.width / numSegments) * i + radius + 1,
            y: d.center.y,
            radius,
        }));
    head = {
        x: segments[0].x,
        y: segments[0].y,
        radius: radius * PHI,
        direction: TAO / -8,
    };

    // Second creature
    numBones = 10;
    boneLength = 40;
    boneSets = [];
    for (let i = 0; i < 10; i++) {
        bones = Array(numBones)
            .fill(null)
            .map((_, i) => ({
                top: {
                    x: (i / numBones) * d.width,
                    y: (i / numBones) * d.height,
                },
                bottom: {
                    x: (i / numBones) * d.width + boneLength,
                    y: (i / numBones) * d.height + 0,
                },
            }));
        boneSets.push(bones);
    }
}
function draw() {
    // c.fillStyle = "rgba(0, 0, 0, 0.001)"; // TODO Get calculated body font color
    c.fillStyle = background; // TODO Get calculated body font color
    c.fillRect(0, 0, d.width, d.height);
    c.strokeStyle = "white"; // TODO Get calculated body font color
    c.fillStyle = "white"; // TODO Get calculated body font color

    // head.direction = normalizeAngle(head.direction);
    const prevHead: Point = { ...head };
    let nextDirection = head.direction;
    // The head follows the mouse
    if (controllingWithMouse) {
        head.x = mouseX ?? head.x;
        head.y = mouseY ?? head.y;
        // Adjust head direction based on movement (none if no movement)
        if (
            abs(head.x - prevHead.x) > 0.0001 &&
            abs(head.y - prevHead.y) > 0.0001
        ) {
            nextDirection = atan2(head.y - prevHead.y, head.x - prevHead.x);
            head.direction = circularLerp(head.direction, nextDirection, 0.6);
        }
    } else {
        const wayOut = -80;
        const margin = 40;
        // Way out of bounds?
        if (
            d.width - head.x < wayOut ||
            d.height - head.y < wayOut ||
            head.x < wayOut ||
            head.y < wayOut
        ) {
            head.x = d.center.x;
            head.y = d.center.y;
            nextDirection = Math.random() * TAO;
            head.direction = nextDirection;
        }
        // normal Out of bounds?
        else if (
            d.width - head.x < margin ||
            d.height - head.y < margin ||
            head.x < margin ||
            head.y < margin
        ) {
            // Turn towards the center
            nextDirection = atan2(d.center.y - head.y, d.center.x - head.x);
        }

        head.direction = circularLerp(head.direction, nextDirection, 0.02);

        const speed = 2;
        // Advance
        head.x += cos(head.direction) * speed;
        head.y += sin(head.direction) * speed;
    }

    // The first segment follows the head
    const first = segments[0];
    first.x = lerp(first.x, head.x, 0.07);
    first.y = lerp(first.y, head.y, 0.07);

    // Then every segment follows the previous one
    for (let i = 1; i < segments.length; i++) {
        let last = segments[i - 1];
        let current = segments[i];

        const adjacent = last.x - current.x;
        const other = last.y - current.y;
        const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
        const angle = atan2(other, adjacent);
        const moveDistance =
            hypoteneuse - (last.radius + current.radius) * segmentSpread;

        current.x += cos(angle) * moveDistance;
        current.y += sin(angle) * moveDistance;
    }
    let skinPoints: Array<Point> = [];

    // Points on the head, from left cheek to right before nose
    const directionToHead = atan2(head.y - first.y, head.x - first.x);
    const increment = TAO / 16;
    const cheekCount = 5;
    for (let i = 0; i < cheekCount; i++) {
        const angle = directionToHead + increment * (i - cheekCount);
        skinPoints.push({
            x: first.x + cos(angle) * first.radius,
            y: first.y + sin(angle) * first.radius,
        });
    }

    // The nose
    skinPoints.push({
        x: first.x + cos(directionToHead) * first.radius * PHI,
        y: first.y + sin(directionToHead) * first.radius * PHI,
    });

    // Now down to the right cheek
    for (let i = 1; i <= cheekCount; i++) {
        const angle = directionToHead + increment * i;
        skinPoints.push({
            x: first.x + cos(angle) * first.radius,
            y: first.y + sin(angle) * first.radius,
        });
    }

    for (let i = 1; i < segments.length - 1; i++) {
        let last = segments[i - 1];
        let current = segments[i];
        const direction = atan2(last.y - current.y, last.x - current.x);

        const increment = TAO / 8;
        // At the end we push the right side
        skinPoints.push({
            x: current.x + cos(direction + increment * 1) * current.radius,
            y: current.y + sin(direction + increment * 1) * current.radius,
        });
        skinPoints.push({
            x: current.x + cos(direction + increment * 2) * current.radius,
            y: current.y + sin(direction + increment * 2) * current.radius,
        });
        skinPoints.push({
            x: current.x + cos(direction + increment * 3) * current.radius,
            y: current.y + sin(direction + increment * 3) * current.radius,
        });

        // At the beginning we unshift the left side
        skinPoints.unshift({
            x: current.x + cos(direction - increment * 1) * current.radius,
            y: current.y + sin(direction - increment * 1) * current.radius,
        });
        skinPoints.unshift({
            x: current.x + cos(direction - increment * 2) * current.radius,
            y: current.y + sin(direction - increment * 2) * current.radius,
        });
        skinPoints.unshift({
            x: current.x + cos(direction - increment * 3) * current.radius,
            y: current.y + sin(direction - increment * 3) * current.radius,
        });
    }

    let secondToLast = segments.at(-2)!;
    let last = segments.at(-1)!;
    const lastDirection = atan2(
        secondToLast.y - last.y,
        secondToLast.x - last.x,
    );
    for (
        let i = lastDirection + PI - 5 * increment;
        i < lastDirection + PI + 6 * increment;
        i += increment
    ) {
        skinPoints.push({
            x: last.x + cos(i) * last.radius,
            y: last.y + sin(i) * last.radius,
        });
    }

    // An indicator as to the head, for development purposes.
    if (SHOW_HEAD) {
        c.fillStyle = "rgba(255, 255, 255, 0.2)";
        circle({ ...head });
        c.strokeStyle = "tomato";
        c.lineWidth = 3;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(head.x, head.y);
        c.lineTo(
            head.x + cos(head.direction) * PHI * head.radius,
            head.y + sin(head.direction) * PHI * head.radius,
        );
        c.stroke();
    }

    // The segments
    if (SHOW_SEGMENTS) {
        segments.forEach(({ x, y, radius }, index) => {
            c.fillStyle = `rgba(170, 156, 40, 0.8)`; // TODO Get calculated body font color
            circle({ x, y, radius });
        });
    }

    // The skin
    if (SHOW_SKIN_POINTS) {
        skinPoints.forEach(({ x, y }) => {
            c.fillStyle = `rgba(40, 156, 170, 0.8)`; // TODO Get calculated body font color
            circle({ x, y, radius: 5 });
        });
    }

    if (SHOW_SKIN) {
        const now = Date.now();
        for (let index = 1; index < skinPoints.length; index++) {
            const last = skinPoints[index - 1];
            const current = skinPoints[index];
            const i = index / skinPoints.length;
            const t = (cos((TAO * now) / 2000) + 1) / 2;

            c.beginPath();
            c.moveTo(last.x, last.y);
            c.strokeStyle = foreground;
            // c.strokeStyle = `rgba(${floor(i * 255)}, ${floor(t * 255)}, ${floor(
            //     floor(255 - i * 255),
            // )}, 1)`;
            c.lineTo(current.x, current.y);
            c.stroke();
        }

        {
            const last = skinPoints.at(-1)!;
            const first = skinPoints.at(0)!;
            c.beginPath();
            c.moveTo(last.x, last.y);
            c.lineTo(first.x, first.y);
            c.stroke();
            c.closePath();
        }
    }

    //
    // SECOND CREATURE
    //

    for (let k = 0; k < boneSets.length; k++) {
        bones = boneSets[k];
        for (let j = 0; j < 10; j++) {
            // FORWARDS
            const firstBone = bones[0];
            firstBone.top.x = lerp(
                firstBone.top.x,
                (head.x + k * 13097) % d.width,
                0.07,
            );
            firstBone.top.y = lerp(
                firstBone.top.y,
                (head.y + k * 13097) % d.height,
                0.07,
            );
            firstBone.bottom.x = lerp(firstBone.top.x, head.x, 0.002);
            firstBone.bottom.y = lerp(firstBone.top.y, head.y, 0.002);

            // Every bone follows the previous one
            for (let i = 1; i < bones.length; i++) {
                let lastBone = bones[i - 1];
                let currentBone = bones[i];
                let last = lastBone.bottom;
                let currentTop = currentBone.top;
                let currentBottom = currentBone.bottom;

                const originalAdjacent = currentBottom.x - currentTop.x;
                const originalOther = currentBottom.y - currentTop.y;
                const originalBoneLength = sqrt(
                    originalAdjacent ** 2 + originalOther ** 2,
                );
                {
                    const adjacent = last.x - currentTop.x;
                    const other = last.y - currentTop.y;
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

            // BACKWARDS

            const lastBone = bones.at(-1);
            lastBone.bottom.x = lerp(lastBone.bottom.x, d.width / 2, 0.07);
            lastBone.bottom.y = lerp(lastBone.bottom.y, d.height / 2, 0.07);
            lastBone.top.x = lerp(lastBone.bottom.x, head.x, 0.002);
            lastBone.top.y = lerp(lastBone.bottom.y, head.y, 0.002);

            // Every bone follows the previous one
            for (let i = bones.length - 2; i >= 0; i--) {
                let lastBone = bones[i + 1];
                let currentBone = bones[i];
                let last = lastBone.top;
                let currentBottom = currentBone.bottom;
                let currentTop = currentBone.top;

                const originalAdjacent = currentTop.x - currentBottom.x;
                const originalOther = currentTop.y - currentBottom.y;
                const originalBoneLength = sqrt(
                    originalAdjacent ** 2 + originalOther ** 2,
                );
                {
                    const adjacent = last.x - currentBottom.x;
                    const other = last.y - currentBottom.y;
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

        for (let i = 0; i < bones.length; i++) {
            const { top, bottom } = bones[i];
            c.beginPath();
            c.moveTo(top.x, top.y);
            // c.strokeStyle = foreground;
            c.strokeStyle = `rgba(${floor(i * 255)}, 128, ${floor(
                floor(255 - i * 255),
            )}, 1)`;
            c.fillStyle = c.strokeStyle;
            c.lineWidth = i * PHI;
            c.lineTo(bottom.x, bottom.y);
            c.stroke();
        }
    }
    circle({ x: d.width / 2, y: d.height / 2, radius: 50 });
    requestAnimationFrame(draw);
}

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
    // draw();
});

document.body.addEventListener("keydown", (event) => {
    const { key } = event;
    if (key == "r") {
        c.fillStyle = "#282828"; // TODO Get calculated body font color
        c.fillRect(0, 0, d.width, d.height);
    }
});

window.addEventListener("resize", () => {
    setCanvasDimensions();
    // draw();
});

setCanvasDimensions();
draw();

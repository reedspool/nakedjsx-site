// @ Imports
import { foreground, background } from "./emacs-colors.json";
import {
    PI,
    cos,
    sin,
    sqrt,
    atan2,
    floor,
    abs,
    TAO,
    PHI,
    lerp,
    circularLerp,
    forEachCurrentAndLast,
    generateArray,
    min,
} from "./utilities";

// @ Constants

const SHOW_HEAD = false;
const SEGMENT_SPREAD = 0.3;
const SHOW_SEGMENTS = false;
const SHOW_SKIN_POINTS = false;
const SHOW_SKIN = true;
const BONE_SPREAD = 0;

// @ Canvas Setup

const canvas = document.querySelector("canvas")!;
// @ c for Context
const c = canvas.getContext("2d")!;
// @ d for Dimensions
let d: {
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

// @ Entity definitions

// @ Abstract entities like points
type Point = { x: number; y: number };
type Circle = Point & { radius: number };
function circle({ x, y, radius }: Circle) {
    c.beginPath();
    c.arc(x, y, radius, 0, TAO, true);
    c.fill();
}

const constrainDistance = (
    anchor: Point,
    mover: Point,
    distance: number,
    spread: number = 1,
) => {
    const adjacent = anchor.x - mover.x;
    const other = anchor.y - mover.y;
    const hypoteneuse = sqrt(adjacent ** 2 + other ** 2);
    const angle = atan2(other, adjacent);
    const moveDistance = hypoteneuse - distance * spread;

    mover.x += cos(angle) * moveDistance;
    mover.y += sin(angle) * moveDistance;
};

const followPoint = (first: Point, other: Point, factor: number) => {
    first.x = lerp(first.x, other.x, factor);
    first.y = lerp(first.y, other.y, factor);
};

const distance = (first: Point, second: Point) => {
    const adjacent = first.x - second.x;
    const other = first.y - second.y;
    return sqrt(adjacent ** 2 + other ** 2);
};

// @ Snakes
let snake: Array<Circle>;

let mouseX: number;
let mouseY: number;
let controllingWithMouse = false;
let head: Circle & { direction: number };

// @ Bones
type Bone = {
    top: Point;
    bottom: Point;
};
let bones: Array<Bone>;
let appendages: Array<typeof bones>;

// @ Setup

function setup() {
    c.fillStyle = background;
    c.fillRect(0, 0, d.width, d.height);
    const numSegments = 40;
    const radius = d.width / numSegments / 3 - 1;
    // @ Snake
    snake = generateArray(numSegments, ({ index }) => ({
        x: 40 + (d.width / numSegments) * index + radius + 1,
        y: d.center.y,
        radius,
    }));

    // @ Head
    const { x, y } = snake.at(0)!;
    head = {
        x,
        y,
        radius: radius * PHI,
        direction: TAO / -8,
    };

    // @ All the bones
    appendages = generateArray(16, () =>
        generateArray(40, ({ fraction }) => ({
            top: {
                x: fraction * d.width,
                y: fraction * d.height,
            },
            bottom: {
                x: fraction * d.width + 10, // This original distance is the length of the bone
                y: fraction * d.height + 0,
            },
        })),
    );
}

// @ Draw (in which all data us updated every frame before drawing)
function draw() {
    // @ Draw the background
    // c.fillStyle = "rgba(0, 0, 0, 0.01)";
    c.fillStyle = background;
    c.fillRect(0, 0, d.width, d.height);
    c.strokeStyle = "white";
    c.fillStyle = "white";

    // @ Move the Head
    const prevHead: Point = { ...head };
    let nextDirection = head.direction;

    // @ Sometimes head follows the mouse
    if (controllingWithMouse) {
        head.x = mouseX ?? head.x;
        head.y = mouseY ?? head.y;

        // @ Adjust head direction based on movement (none if no movement)
        if (
            abs(head.x - prevHead.x) > 0.0001 &&
            abs(head.y - prevHead.y) > 0.0001
        ) {
            nextDirection = atan2(head.y - prevHead.y, head.x - prevHead.x);
            head.direction = circularLerp(head.direction, nextDirection, 0.6);
        }
    } else {
        // @ Sometimes head drives around on its own
        const wayOut = -80;
        const margin = 40;
        // @ Head went way out of bounds?
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
        // @ Head went a little out of bounds?
        else if (
            d.width - head.x < margin ||
            d.height - head.y < margin ||
            head.x < margin ||
            head.y < margin
        ) {
            // @ Turn towards the center
            nextDirection = atan2(d.center.y - head.y, d.center.x - head.x);
        }

        head.direction = circularLerp(head.direction, nextDirection, 0.02);

        const speed = 2;
        // @ Move the head forward
        head.x += cos(head.direction) * speed;
        head.y += sin(head.direction) * speed;
    }

    // @ The first snake segment follows the head
    followPoint(snake.at(0)!, head, 0.07);

    // @ Then every snake segment follows the previous one
    forEachCurrentAndLast(snake, ({ last, current, index: i }) => {
        constrainDistance(
            last,
            current,
            last.radius + current.radius,
            SEGMENT_SPREAD,
        );
    });
    let skinPoints: Array<Point> = [];

    // @ Collect points from the border of the snake to create skin
    // @ from left cheek to right before nose
    const first = snake.at(0)!;
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

    // @ the nose
    skinPoints.push({
        x: first.x + cos(directionToHead) * first.radius * PHI,
        y: first.y + sin(directionToHead) * first.radius * PHI,
    });

    // @ then down to the right cheek
    for (let i = 1; i <= cheekCount; i++) {
        const angle = directionToHead + increment * i;
        skinPoints.push({
            x: first.x + cos(angle) * first.radius,
            y: first.y + sin(angle) * first.radius,
        });
    }

    forEachCurrentAndLast(snake, ({ current, last, index }) => {
        if (index === snake.length - 1) return;

        const direction = atan2(last.y - current.y, last.x - current.x);

        const increment = TAO / 8;
        // @ Push the skin points on the right side of the body to the end of the list
        skinPoints.push(
            {
                x: current.x + cos(direction + increment * 1) * current.radius,
                y: current.y + sin(direction + increment * 1) * current.radius,
            },
            {
                x: current.x + cos(direction + increment * 2) * current.radius,
                y: current.y + sin(direction + increment * 2) * current.radius,
            },
            {
                x: current.x + cos(direction + increment * 3) * current.radius,
                y: current.y + sin(direction + increment * 3) * current.radius,
            },
        );

        // @ Simultaneously unshift the right side skin points to the beginning of the list
        skinPoints.unshift(
            {
                x: current.x + cos(direction - increment * 1) * current.radius,
                y: current.y + sin(direction - increment * 1) * current.radius,
            },
            {
                x: current.x + cos(direction - increment * 2) * current.radius,
                y: current.y + sin(direction - increment * 2) * current.radius,
            },
            {
                x: current.x + cos(direction - increment * 3) * current.radius,
                y: current.y + sin(direction - increment * 3) * current.radius,
            },
        );
    });

    // @ Finally, add the skin points on the butt of the snake
    let secondToLast = snake.at(-2)!;
    let last = snake.at(-1)!;
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

    // @ Draw the head
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

    // @ Draw the snake
    if (SHOW_SEGMENTS) {
        snake.forEach(({ x, y, radius }) => {
            c.fillStyle = `rgba(170, 156, 40, 0.8)`;
            circle({ x, y, radius });
        });
    }

    // @ Draw the skin control points
    if (SHOW_SKIN_POINTS) {
        skinPoints.forEach(({ x, y }) => {
            c.fillStyle = `rgba(40, 156, 170, 0.8)`;
            circle({ x, y, radius: 5 });
        });
    }

    // @ Draw the actual skin
    if (SHOW_SKIN) {
        const now = Date.now();
        forEachCurrentAndLast(skinPoints, ({ current, last, index }) => {
            const i = index / skinPoints.length;
            const t = (cos((TAO * now) / 2000) + 1) / 2;

            c.beginPath();
            c.moveTo(last.x, last.y);
            c.strokeStyle = `rgba(${floor(i * 255)}, ${floor(t * 255)}, ${floor(
                floor(255 - i * 255),
            )}, 1)`;
            c.lineTo(current.x, current.y);
            c.stroke();
        });

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

    // @ Begin moving around the second creature

    for (let k = 0; k < appendages.length; k++) {
        bones = appendages[k];
        // @ Inverse kinematics loop: going to repeat the backwards and forward motions
        for (let j = 0; j < 10; j++) {
            // @ First, move each appendage forward towards its goal
            const firstBone = bones[0];
            followPoint(
                firstBone.top,
                {
                    // @ Every appendage is following a random shadow of the head a deterministic distance away
                    x: (head.x + k * 13097) % d.width,
                    y: (head.y + k * 13097) % d.height,
                },
                0.07,
            );
            constrainDistance(firstBone.top, firstBone.bottom, 0);
            // followPoint(firstBone.bottom, firstBone.top, 0.02);

            // @ Every bone in the appendage follows the previous one
            forEachCurrentAndLast(bones, ({ last, current }) => {
                // @ Calculate the bone length before moving
                // TODO Could record this in the data structure instead
                const originalBoneLength = distance(
                    current.bottom,
                    current.top,
                );

                // @ Then constrain one bone's connection to the previous one
                constrainDistance(last.bottom, current.top, BONE_SPREAD);

                // @ Then constrain the bone's original length, so it doesn't stretch
                constrainDistance(
                    current.top,
                    current.bottom,
                    originalBoneLength,
                    1,
                );
            });

            // @ Now reverse the kinematics, move the last bone back to its original position
            const lastBone = bones.at(-1)!;
            // @ Each appendage is anchored at the center of the screen
            lastBone.bottom.x = d.width / 2;
            lastBone.bottom.y = d.height / 2;
            followPoint(lastBone.top, lastBone.bottom, 0.2);

            // @ Every bone follows the previous one
            forEachCurrentAndLast(bones.toReversed(), ({ current, last }) => {
                // @ Again, calculate bone length
                const originalBoneLength = distance(
                    current.top,
                    current.bottom,
                );

                // @ Again, move the bone connector to match its pair
                constrainDistance(last.top, current.bottom, BONE_SPREAD);
                // @ And again, constrain the length of the bone to not stretch
                constrainDistance(
                    current.bottom,
                    current.top,
                    originalBoneLength,
                );
            });
        }
        // @ Finally, draw each bone
        for (let i = 0; i < bones.length; i++) {
            const { top, bottom } = bones[i];
            c.beginPath();
            c.moveTo(top.x, top.y);
            c.strokeStyle = foreground;
            // c.strokeStyle = `rgba(${floor(i * 255)}, 128, ${floor(
            //     floor(255 - i * 255),
            // )}, 1)`;
            c.fillStyle = c.strokeStyle;
            c.lineWidth = min(i / PHI, 5);
            c.lineTo(bottom.x, bottom.y);
            c.stroke();
        }
    }

    // @ Draw the spider's body
    circle({ x: d.width / 2, y: d.height / 2, radius: 10 });

    // @ Repeat all calculations and drawing each frame
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
canvas.addEventListener("mouseup", () => {
    // @ Click to toggle beings following the mouse
    controllingWithMouse = !controllingWithMouse;
});
canvas.addEventListener("mousedown", () => {
    // draw();
});

document.body.addEventListener("keydown", (event) => {
    const { key } = event;
    // @ Press 'r' to redraw (useful when background is semitransparent)
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

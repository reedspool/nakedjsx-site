const { PI, cos, sin, sqrt, atan2, abs } = Math;
const TAO = PI * 2;
const PHI = 1.618033988749895;
const lerp = (v0: number, v1: number, t: number) =>
    // a * t + (b - a) * t
    v0 + t * (v1 - v0);
const normalizeAngle = (angle: number) => (angle + TAO) % TAO;

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
function setup() {
    c.fillStyle = "#282828"; // TODO Get calculated body font color
    c.fillRect(0, 0, d.width, d.height);
    numSegments = 180;
    const radius = d.width / numSegments / 1 - 1;
    segments = Array(numSegments)
        .fill(null)
        .map((_, i) => ({
            x: (d.width / numSegments) * i + radius + 1,
            y: d.center.y,
            radius,
        }));
    head = {
        x: segments[0].x,
        y: segments[0].y,
        radius: radius * 4,
        direction: 0,
    };
}
function draw() {
    c.fillStyle = "rgba(100, 100, 100, 0.001)"; // TODO Get calculated body font color
    c.fillRect(0, 0, d.width, d.height);
    c.strokeStyle = "white"; // TODO Get calculated body font color
    c.fillStyle = "white"; // TODO Get calculated body font color

    // head.direction = normalizeAngle(head.direction);
    const prevHead: Point = { ...head };
    let nextDirection = head.direction;
    // The head follows the mouse
    if (controllingWithMouse) {
        // Adjust head direction based on movement (none if no movement)
        if (
            abs(head.x - prevHead.x) > 0.0001 &&
            abs(head.y - prevHead.y) > 0.0001
        ) {
            nextDirection = atan2(head.y - prevHead.y, head.x - prevHead.x);
        }
    } else {
        const wayOut = -50;
        const margin = -10;
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
            // head.direction = 0;
            // nextDirection = 0;
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
    }

    head.direction =
        lerp(
            normalizeAngle(head.direction) + TAO,
            normalizeAngle(nextDirection) + TAO,
            0.1,
        ) % TAO;

    if (controllingWithMouse) {
        head.x = mouseX ?? head.x;
        head.y = mouseY ?? head.y;
    } else {
        const speed = 8;
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
            hypoteneuse - (last.radius + current.radius) * 0.38;

        current.x += cos(angle) * moveDistance;
        current.y += sin(angle) * moveDistance;
    }
    let skinPoints: Array<Point>;
    for (let i = 1; i < segments.length; i++) {
        let last = segments[i - 1];
        let current = segments[i];
    }

    // c.fillStyle = "rgba(255, 255, 255, 0.2)";
    // circle({ ...head });
    // c.strokeStyle = "red";
    // c.beginPath();
    // c.moveTo(head.x, head.y);
    // c.lineTo(
    //     head.x + cos(head.direction) * PHI * head.radius,
    //     head.y + sin(head.direction) * PHI * head.radius,
    // );
    // c.stroke();
    segments.forEach(({ x, y, radius }, index) => {
        // if (index % 2 === 1) return;

        c.fillStyle = `rgba(${255 - cos((TAO * index) / numSegments) * 255}, ${
            (cos((TAO * Date.now()) / 1000) / 2) * 255
        }, ${cos((TAO * index) / numSegments) * 255}, 0.8)`; // TODO Get calculated body font color
        circle({ x, y, radius });
    });

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

const { PI, cos, sin, sqrt, atan2 } = Math;
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
    c.arc(x, y, radius, 0, PI * 2, true);
    c.stroke();
}

let numSegments: number;
let segments: Array<Circle>;
let mouseX: number;
let mouseY: number;
let drawing = false;
function setup() {
    numSegments = 40;
    const radius = d.width / numSegments / 1 - 1;
    segments = Array(numSegments)
        .fill(null)
        .map((_, i) => ({
            x: (d.width / numSegments) * i + radius + 1,
            y: d.center.y,
            radius,
        }));
}
function draw() {
    c.fillStyle = "#282828"; // TODO Get calculated body font color
    c.fillRect(0, 0, d.width, d.height);
    c.strokeStyle = "white"; // TODO Get calculated body font color
    c.fillStyle = "white"; // TODO Get calculated body font color
    const head = segments[0];
    head.x = mouseX ?? d.center.x;
    head.y = mouseY ?? d.center.y;
    for (let i = 1; i < segments.length; i++) {
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

    if (drawing) circle({ x: mouseX, y: mouseY, radius: 5 });

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

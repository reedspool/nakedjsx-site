export const { PI, cos, sin, sqrt, atan2, abs, floor, min, max, random } = Math;
export const TAO = PI * 2;
export const PHI = 1.618033988749895;
export const lerp = (v0: number, v1: number, t: number) => v0 + t * (v1 - v0);
export const normalizeAngle = (angle: number) => (angle + TAO) % TAO;
// The unit circle starts pointing directly east, and sweeps south then west
// because Y grows downwards.
export const mapDirections = (angle: number) => {
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
// From https://stackoverflow.com/a/14498790
export const circularLerp = (v0: number, v1: number, t: number) => {
    const shortestAngle = ((v1 - v0 + PI) % TAO) - PI;
    // TODO: This still doesn't quite work how I want it to.
    return lerp(v0, v0 + shortestAngle, t);
};

export const forEachCurrentAndLast: <T>(
    g: Array<T>,
    callback: (props: { current: T; last: T; index: number }) => void,
) => void = (g, callback) => {
    for (let index = 1; index < g.length; index++) {
        let last = g[index - 1];
        let current = g[index];
        callback({ current, last, index });
    }
};

export const generateArray: <T>(
    n: number,
    callback: (props: { index: number; fraction: number }) => T,
) => Array<T> = (n, callback) =>
    Array(n)
        .fill(null)
        .map((_, index) => {
            return callback({ index, fraction: index / n });
        });

export const randInt = (max: number) => Math.floor(Math.random() * max);
export const randIntBetween = (min: number, max: number) =>
    randInt(max - min) + min;
export const randFrom = (array: unknown[]) => array[randInt(array.length)];
export const clamp = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(n, min));

export const wait = (millis: number) =>
    new Promise((resolve) => setTimeout(resolve, millis));

export const complexStringify = (object: unknown) =>
    JSON.stringify(
        object,
        function replacer(_key, value) {
            if (value instanceof Map) {
                return {
                    dataType: "Map",
                    value: Array.from(value.entries()),
                };
            } else if (value instanceof Set) {
                return {
                    dataType: "Set",
                    value: Array.from(value.entries()),
                };
            } else {
                return value;
            }
        },
        2,
    );

// From https://stackoverflow.com/a/12646864
export function shuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
export function shuffleCopy<T>(array: T[]) {
    const copy = [...array];
    shuffle(copy);
    return copy;
}

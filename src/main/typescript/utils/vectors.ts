export type Vec2 = [number, number];

export const Vec2 = {
    from: (x: number, y: number): Vec2 => [x, y],
    add: ([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 => [x1 + x2, y1 + y2],
    addMut: (target: Vec2, [x, y]: Vec2): void => { target[0] += x; target[1] += y; },
    sub: ([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 => [x1 - x2, y1 - y2],
    len: ([x, y]: Vec2) => Math.sqrt(x * x + y * y),
    dot: ([x1, y1]: Vec2, [x2, y2]: Vec2) => x1 * x2 + y1 * y2,
    angle: (u: Vec2, v: Vec2) => Math.acos(Vec2.dot(u, v) / (Vec2.len(u) * Vec2.len(v))),
    orthogonal: ([a, b]: Vec2): Vec2 => [-b, a],
};

export const dichotomy = (
    lower: number,
    upper: number,
    f: (x: number) => number,
    itersLeft = 1000,
    computeMiddle: (lower: number, upper: number) => number = (a, b) => (a + b) / 2
): number => {
    const mid = computeMiddle(lower, upper);

    if (itersLeft === 0 || mid === lower || mid === upper) {
        return mid;
    }

    const x = f(mid);

    if (x === 0) return mid;

    const [newLower, newUpper] = x < 0 ? [mid, upper] : [lower, mid];

    return dichotomy(newLower, newUpper, f, itersLeft - 1, computeMiddle);
};

export const gcd = (a: number, b: number): number => {
    if (b === 0) return a;
    return gcd(b, a % b);
};

export const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

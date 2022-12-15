import { sorted } from "./iterators";

export type Range = [start: number, end: number];

export const Range = {
    overlaps: ([a1, a2]: Range, [b1, b2]: Range) => {
        return a1 <= b2 && a2 >= b1;
    },
    merge: (ranges: Range[]): Range[] => {
        const merged: Range[] = [];
        const ordered = sorted(
            ranges.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]),
            ([x1], [x2]) => x1 - x2
        );

        for (const [a, b] of ordered) {
            if (merged.length === 0) {
                merged.push([a, b]);
            } else {
                const last = merged.at(-1)!;
                if (Range.overlaps(last, [a, b])) {
                    last[1] = Math.max(last[1], b);
                } else {
                    merged.push([a, b]);
                }
            }
        }

        return merged;
    },
    magnitude: ([a, b]: Range) => b - a + 1,
};

import { readFileSync } from 'fs';
import { indexed, map, range, skip } from '../utils/iterators';
import { run } from '../utils/run';
import { Vec2 } from '../utils/vectors';

const parseInput = () => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => {
            const [dir, steps] = line.split(' ');
            return { dir: dir as Direction, steps: Number(steps) };
        });
};

type Direction = 'R' | 'L' | 'U' | 'D';

const DIRECTION_DELTA: Record<Direction, Vec2> = {
    L: [-1, 0],
    R: [1, 0],
    U: [0, -1],
    D: [0, 1],
};

class Grid {
    knots: Vec2[];
    visitedCells: Set<string>;

    constructor(knots: number) {
        this.knots = [...map(range(1, knots), () => Vec2.from(0, 0))];
        this.visitedCells = new Set();
    }

    private static follow(dx: number, dy: number): Vec2 {
        if (dx === 2 && dy === 0) {
            // right
            return [1, 0];
        }

        if (dx == -2 && dy == 0) {
            // left
            return [-1, 0];
        }

        if (dx === 0 && dy === 2) {
            // Down
            return [0, 1];
        }

        if (dx === 0 && dy === -2) {
            // Up
            return [0, -1];
        }

        if (Math.abs(dx) >= 1 && dy >= 2) {
            // diag up
            return [Math.sign(dx), 1];
        }

        if (Math.abs(dx) >= 1 && dy <= -2) {
            // diag down
            return [Math.sign(dx), -1];
        }

        if (dx >= 2 && Math.abs(dy) >= 1) {
            return [1, Math.sign(dy)];
        }

        if (dx <= -2 && Math.abs(dy) >= 1) {
            return [-1, Math.sign(dy)];
        }

        return [0, 0];
    }

    moveHead(dir: Direction) {
        Vec2.addMut(this.knots[0], DIRECTION_DELTA[dir]);

        for (const [knot, index] of skip(indexed(this.knots), 1)) {
            const previousKnot = this.knots[index - 1];
            const [dx, dy] = Vec2.sub(previousKnot, knot);
            Vec2.addMut(knot, Grid.follow(dx, dy));

            if (index === this.knots.length - 1) {
                this.visitedCells.add(`${knot[0]}:${knot[1]}`);
            }
        }
    }
}

const part1 = () => {
    const moves = parseInput();
    const grid = new Grid(2);

    for (const { dir, steps } of moves) {
        for (const _ of range(1, steps)) {
            grid.moveHead(dir);
        }
    }

    return grid.visitedCells.size;
};

const part2 = () => {
    const moves = parseInput();
    const grid = new Grid(10);

    for (const { dir, steps } of moves) {
        for (const _ of range(1, steps)) {
            grid.moveHead(dir);
        }
    }

    return grid.visitedCells.size;
};

run({ part1, part2 });

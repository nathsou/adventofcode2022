import { readFileSync } from 'fs';
import { indexed, map, range, skip } from '../utils/iterators';
import { run } from '../utils/run';
import { Vec2 } from '../utils/vectors';

type Direction = 'R' | 'L' | 'U' | 'D';
type Move = { direction: Direction, steps: number };

const parseInput = (): Move[] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => {
            const [dir, steps] = line.split(' ');
            return { direction: dir as Direction, steps: Number(steps) };
        });
};

const DIRECTION_DELTA: Record<Direction, Vec2> = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] };

class Grid {
    knots: Vec2[];
    visitedCells: Set<string>;

    constructor({ knots }: { knots: number }) {
        this.knots = [...map(range(1, knots), () => Vec2.from(0, 0))];
        this.visitedCells = new Set();
    }

    private static follow(dx: number, dy: number): Vec2 {
        if (
            (Math.abs(dx) > 1 && dy === 0) ||
            (dx === 0 && Math.abs(dy) > 1) ||
            (Math.abs(dx) > 1 && Math.abs(dy) > 0) ||
            (Math.abs(dx) > 0 && Math.abs(dy) > 1)
        ) {
            return [Math.sign(dx), Math.sign(dy)];
        }

        return [0, 0];
    }

    private moveHead(direction: Direction) {
        Vec2.addMut(this.knots[0], DIRECTION_DELTA[direction]);

        for (const [knot, index] of skip(indexed(this.knots), 1)) {
            const previousKnot = this.knots[index - 1];
            const [dx, dy] = Vec2.sub(previousKnot, knot);
            Vec2.addMut(knot, Grid.follow(dx, dy));

            if (index === this.knots.length - 1) {
                this.visitedCells.add(`${knot[0]}:${knot[1]}`);
            }
        }
    }

    run(moves: Move[]): number {
        for (const { direction, steps } of moves) {
            for (const _ of range(1, steps)) {
                this.moveHead(direction);
            }
        }

        return this.visitedCells.size;
    }
}

const part1 = () => new Grid({ knots: 2 }).run(parseInput());
const part2 = () => new Grid({ knots: 10 }).run(parseInput());

run({ part1, part2 });

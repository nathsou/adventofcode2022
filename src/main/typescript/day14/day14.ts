import { readFileSync } from 'fs';
import { countWhile, forever, history, map, max, range } from '../utils/iterators';
import { run } from '../utils/run';
import { Vec2 } from '../utils/vectors';

type Line = [Vec2, Vec2];
type Path = Line[];
type CellState = 'sand' | 'air' | 'rock';

const parsePath = (line: string): Path => {
    const points = line
        .split(' -> ')
        .map(point => point.split(','))
        .map(([x, y]) => Vec2.from(Number(x), Number(y)));

    return [...map<Vec2[], Line>(history(points, 2), ([a, b]) => [a, b])];
};

const parseInput = (): Path[] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(parsePath);
};

class Sandbox {
    private grid: Map<`${number}:${number}`, CellState> = new Map();
    private deepestLineY: number;

    constructor(paths: Path[]) {
        for (const path of paths) {
            for (const [start, end] of path) {
                for (const x of range(start[0], end[0])) {
                    this.grid.set(`${x}:${start[1]}`, 'rock');
                }

                for (const y of range(start[1], end[1])) {
                    this.grid.set(`${end[0]}:${y}`, 'rock');
                }
            }
        }

        this.deepestLineY = max(
            paths.flatMap(path => path.flatMap(([start, end]) => [start[1], end[1]]))
        ).value;
    }

    at([x, y]: Vec2): CellState {
        return this.grid.get(`${x}:${y}`) ?? 'air';
    }

    isAvailable([x, y]: Vec2, floorDepth: number): boolean {
        return y !== floorDepth && this.at([x, y]) === 'air';
    }

    addGrain({ hasFloor }: { hasFloor: boolean }): boolean {
        const sandGrain = Vec2.from(500, 0);
        const floorDepth = hasFloor ? this.deepestLineY + 2 : Infinity;

        while ((hasFloor && !this.grid.has('500:0')) || (!hasFloor && (sandGrain[1] <= this.deepestLineY))) {
            if (this.isAvailable(Vec2.add(sandGrain, [0, 1]), floorDepth)) {
                Vec2.addMut(sandGrain, [0, 1]);
            } else {
                if (this.isAvailable(Vec2.add(sandGrain, [-1, 1]), floorDepth)) {
                    Vec2.addMut(sandGrain, [-1, 1]);
                } else if (this.isAvailable(Vec2.add(sandGrain, [1, 1]), floorDepth)) {
                    Vec2.addMut(sandGrain, [1, 1]);
                } else {
                    this.grid.set(`${sandGrain[0]}:${sandGrain[1]}`, 'sand');
                    return true;
                }
            }
        }

        return false;
    }
}

const part1 = () => {
    const sandbox = new Sandbox(parseInput());
    return countWhile(forever(), () => sandbox.addGrain({ hasFloor: false }));
};

const part2 = () => {
    const sandbox = new Sandbox(parseInput());
    return countWhile(forever(), () => sandbox.addGrain({ hasFloor: true }));
};

run({ part1, part2 });

import { readFileSync } from 'fs';
import { cycle, max, slice, sum } from '../utils/iterators';
import { run } from '../utils/run';
import { Vec2 } from '../utils/vectors';

type Shape = ('#' | '.')[][];

const ROCK_SHAPES: Shape[] = [
    [['#', '#', '#', '#']],
    [['.', '#', '.'], ['#', '#', '#'], ['.', '#', '.']],
    [['.', '.', '#'], ['.', '.', '#'], ['#', '#', '#']],
    [['#'], ['#'], ['#'], ['#']],
    [['#', '#'], ['#', '#']],
];

type Dir = '<' | '>';

const parseInput = (): Dir[] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('') as Dir[];
};

const CHAMBER_WIDTH = 7;
const DIR_DELTA = { '<': [-1, 0], '>': [1, 0], 'v': [0, -1] };

const hash = (x: number, y: number) => y * CHAMBER_WIDTH + x;

type Cycle = { deltaYs: number[], startIndex: number, length: number };

class Chamber {
    private rocks = new Set<number>();
    private rock: { shape: Shape, pos: Vec2 };
    public maxY = -1;
    private topMostRocks = [-1, -1, -1, -1, -1, -1, -1];

    constructor() {
        this.rock = { shape: ROCK_SHAPES[0], pos: Vec2.from(2, 0) };
    }

    private hash(): string {
        const result: string[] = [];
        const highestY = max(this.topMostRocks).value;
        const lowestY = Math.max(highestY - 50, 0);

        for (let y = lowestY; y <= highestY; y++) {
            const line: string[] = [];
            for (let x = 0; x < CHAMBER_WIDTH; x++) {
                line.push(this.rocks.has(hash(x, y)) ? '#' : '.');
            }
            result.push(line.join(''));
        }

        return result.join('\n');
    }

    public addRock(shape: Shape) {
        const pos = Vec2.from(2, this.maxY + 3 + shape.length);
        this.rock = { shape, pos };
    }

    public moveRock(dir: '<' | '>' | 'v'): boolean {
        const [dx, dy] = DIR_DELTA[dir];
        for (let j = 0; j < this.rock.shape.length; j++) {
            for (let i = 0; i < this.rock.shape[j].length; i++) {
                if (this.rock.shape[j][i] === '#') {
                    if (
                        this.rock.pos[0] + i + dx < 0 ||
                        this.rock.pos[0] + i + dx >= CHAMBER_WIDTH ||
                        this.rock.pos[1] - j + dy < 0 ||
                        this.rocks.has(hash(this.rock.pos[0] + i + dx, this.rock.pos[1] - j + dy))
                    ) {
                        return false;
                    }
                }
            }
        }

        Vec2.addMut(this.rock.pos, [dx, dy]);
        return true;
    }

    public bringRockToRest() {
        this.maxY = Math.max(this.maxY, this.rock.pos[1]);
        for (let j = 0; j < this.rock.shape.length; j++) {
            for (let i = 0; i < this.rock.shape[j].length; i++) {
                if (this.rock.shape[j][i] === '#') {
                    const x = this.rock.pos[0] + i;
                    const y = this.rock.pos[1] - j;
                    this.rocks.add(hash(x, y));
                    this.topMostRocks[x] = Math.max(this.topMostRocks[x], y);
                }
            }
        }
    }

    public findCycle(dirs: Dir[]): Cycle {
        this.addRock(ROCK_SHAPES[0]);
        let shapeIndex = 0;
        let rockIndex = 0;
        const memo = new Map<string, number>();
        const deltaYs: number[] = [];

        for (const dir of cycle(dirs)) {
            this.moveRock(dir);
            const movedDown = this.moveRock('v');
            if (!movedDown) {
                const prevMaxY = this.maxY;
                this.bringRockToRest();
                const deltaY = this.maxY - prevMaxY;
                deltaYs.push(deltaY);
                shapeIndex = (shapeIndex + 1) % ROCK_SHAPES.length;
                rockIndex += 1;

                const key = this.hash();
                if (memo.has(key)) {
                    const startIndex = memo.get(key)!;
                    return {
                        deltaYs,
                        startIndex,
                        length: rockIndex - startIndex,
                    };
                }

                memo.set(key, rockIndex);
                this.addRock(ROCK_SHAPES[shapeIndex]);
            }
        }

        throw 'unreachable';
    }
}

const computeTotalHeight = ({ startIndex, length, deltaYs }: Cycle, N: number): number => {
    const heightBeforeCycle = sum(slice(deltaYs, 0, startIndex - 1));
    const deltaYPerCycle = sum(slice(deltaYs, startIndex));
    const rocksBeforeCycle = startIndex;
    const cycles = Math.floor((N - rocksBeforeCycle) / length);
    const heightAfterCycle = heightBeforeCycle + cycles * deltaYPerCycle;

    let remainingRocks = N - rocksBeforeCycle - cycles * length;
    let totalHeight = heightAfterCycle;

    for (const deltaY of slice(deltaYs, startIndex)) {
        if (remainingRocks === 0) {
            break;
        }

        remainingRocks -= 1;
        totalHeight += deltaY;
    }

    return totalHeight;
};

const chamber = new Chamber();
const rockCycle = chamber.findCycle(parseInput());

const part1 = () => computeTotalHeight(rockCycle, 2022);
const part2 = () => computeTotalHeight(rockCycle, 1000000000000);

run({ part1, part2 });

import { readFileSync } from 'fs';
import { all, any, count, II, map, max, pairs, prod, range, slice, sum } from '../utils/iterators';
import { Matrix } from '../utils/matrix';
import { run } from '../utils/run';

const parseInput = (): Matrix => {
    return new Matrix(
        readFileSync('./input.txt')
            .toString('utf-8')
            .split('\n')
            .map(line => line.split('').map(Number))
    );
};

const isEdge = (i: number, j: number, trees: Matrix): boolean => {
    return i === 1 || i === trees.dims.rows || j === 1 || j === trees.dims.cols;
};

const lines = (i: number, j: number, trees: Matrix): II<number>[] => {
    const row = trees.row(i);
    const col = trees.column(j);

    const left = slice(row, j - 2, 0);
    const right = slice(row, j);
    const top = slice(col, i - 2, 0);
    const bottom = slice(col, i);

    return [left, right, top, bottom];
};

const isTreeVisible = (i: number, j: number, trees: Matrix): boolean => {
    if (isEdge(i, j, trees)) { return true; }

    const treeHeight = trees.at(i, j);
    return any(lines(i, j, trees), heights => all(heights, h => h < treeHeight));
};

const countVisibleTrees = (heights: II<number>, treeHeight: number): number => {
    let count = 0;

    for (const h of heights) {
        if (treeHeight > h) {
            count += 1;
        } else {
            count += 1;
            break;
        }
    }

    return count;
};

const scenicScore = (i: number, j: number, trees: Matrix): number => {
    if (isEdge(i, j, trees)) { return 0; }
    const treeHeight = trees.at(i, j);

    return prod(map(
        lines(i, j, trees),
        heights => countVisibleTrees(heights, treeHeight)
    ));
};

const part1 = (): number => {
    const trees = parseInput();

    return count(
        pairs(range(1, trees.dims.rows), range(1, trees.dims.cols)),
        ([i, j]) => isTreeVisible(i, j, trees)
    );
};

const part2 = (): number => {
    const trees = parseInput();

    return max(map(
        pairs(range(1, trees.dims.rows), range(1, trees.dims.cols)),
        ([i, j]) => scenicScore(i, j, trees)
    )).value;
};

run({ part1, part2 });

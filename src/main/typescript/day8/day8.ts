import { readFileSync } from 'fs';
import { Matrix } from '../utils/matrix';

const parseInput = () => {
    return new Matrix(readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => line.split('').map(Number))
    );
};

const isTreeVisibleInLine = (line: number[], height: number): boolean => {
    return line.every(h => h < height);
};

const isTreeVisible = (i: number, j: number, trees: Matrix): boolean => {
    if (i === 1 || i === trees.dims.rows || j === 1 || j === trees.dims.cols) {
        return true;
    }

    const height = trees.at(i, j);
    const row = trees.row(i - 1);

    const left = row.slice(0, j - 1);

    if (isTreeVisibleInLine(left, height)) {
        return true;
    }

    const right = row.slice(j);
    if (isTreeVisibleInLine(right, height)) {
        return true;
    }

    const col = trees.column(j);

    const top = col.slice(0, i - 1);
    if (isTreeVisibleInLine(top, height)) {
        return true;
    }

    const bottom = col.slice(i);
    if (isTreeVisibleInLine(bottom, height)) {
        return true;
    }

    return false;
};

const countVisibleTrees = (line: number[], height: number): number => {
    let count = 0;

    for (let i = 0; i < line.length; i++) {
        if (height > line[i]) {
            count += 1;
        } else {
            count += 1;
            break;
        }
    }

    return count;
};

const scenicScore = (i: number, j: number, trees: Matrix): number => {
    if (i === 1 || i === trees.dims.rows || j === 1 || j === trees.dims.cols) {
        return 0;
    }

    const height = trees.at(i, j);
    const row = trees.row(i - 1);

    const left = row.slice(0, j - 1).reverse();
    const right = row.slice(j);
    const col = trees.column(j);
    const top = col.slice(0, i - 1).reverse();
    const bottom = col.slice(i);

    const scoreLeft = countVisibleTrees(left, height);
    const scoreRight = countVisibleTrees(right, height);
    const scoreTop = countVisibleTrees(top, height);
    const scoreBottom = countVisibleTrees(bottom, height);

    return scoreLeft * scoreRight * scoreTop * scoreBottom;
};

const part1 = () => {
    const trees = parseInput();
    let total = 0;

    for (let i = 1; i <= trees.dims.rows; i++) {
        for (let j = 1; j <= trees.dims.cols; j++) {
            if (isTreeVisible(i, j, trees)) {
                total += 1;
            }
        }
    }

    return total;
};

const part2 = (): number => {
    const trees = parseInput();
    let maxScore = 0;

    for (let i = 1; i <= trees.dims.rows; i++) {
        for (let j = 1; j <= trees.dims.cols; j++) {
            maxScore = Math.max(maxScore, scenicScore(i, j, trees));
        }
    }

    return maxScore;
};

console.log(part2());

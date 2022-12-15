import { readFileSync } from 'fs';
import { It, sum } from '../utils/iterators';
import { Range } from '../utils/ranges';
import { run } from '../utils/run';
import { Vec2 } from '../utils/vectors';

const regex = /Sensor at x=(?<x1>-?\d+), y=(?<y1>-?\d+): closest beacon is at x=(?<x2>-?\d+), y=(?<y2>-?\d+)/;

const parseInput = () => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => {
            const match = line.match(regex);
            if (match == null) {
                throw new Error(`Invalid line: ${line}`);
            }

            const [_, x1, y1, x2, y2] = [...match.values()];
            const sensor = Vec2.from(Number(x1), Number(y1));
            const beacon = Vec2.from(Number(x2), Number(y2));

            return {
                sensor,
                beacon,
                dist: Vec2.manhattan(sensor, beacon),
            };
        });
};

const part1 = (lineY = 2000000) => {
    const input = parseInput();
    const beaconsOnLine = new Set(
        input
            .filter(({ beacon: [_, y] }) => y === lineY)
            .map(({ beacon: [x, y] }) => `${x}:${y}`)
    ).size;

    const ranges: Range[] = [];

    for (const { sensor: [x, y], dist } of input) {
        if (lineY >= y - dist && lineY <= y + dist) {
            const d = y >= lineY ? y - dist - lineY : y + dist - lineY;
            ranges.push([x - d, x + d]);
        }
    }

    return sum(Range.merge(ranges).map(Range.magnitude)) - beaconsOnLine;
};

function* sensorBoundaryEdges([x, y]: Vec2, dist: number): It<Vec2> {
    for (let i = 0; i <= dist; i++) {
        yield [x + i, y + dist - i];
        yield [x + i, y - dist + i];
        yield [x - i, y + dist - i];
        yield [x - i, y - dist + i];
    }
}

const part2 = (maxXY = 4_000_000) => {
    const input = parseInput();

    for (const { sensor, dist } of input) {
        // We know that the target beacon in not inside a rotated square around the sensor
        // however it cannot be more than 1 unit away from a sensor boundary
        // since there is only one undetected beacon
        // so we can traverse only the outer edges of the square
        for (const [x, y] of sensorBoundaryEdges(sensor, dist + 1)) {
            if (x >= 0 && y >= 0 && x <= maxXY && y <= maxXY) {
                if (input.every(({ sensor, dist }) => Vec2.manhattan(sensor, [x, y]) > dist)) {
                    return x * 4_000_000 + y;
                }
            }
        }
    }
};

run({ part1, part2 });

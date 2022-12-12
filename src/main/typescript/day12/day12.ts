import { readFileSync } from 'fs';
import { dijkstra, Graph } from '../utils/graphs';
import { indexed, min, pairs, range } from '../utils/iterators';
import { run } from '../utils/run';

const parseInput = (): string[][] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => line.split(''));
};

const buildGraph = (lines: string[][]) => {
    type Label = `${number}:${number}`;
    const label = (row: number, col: number): Label => `${row}:${col}`;
    let startLabel = label(1, 1);
    let endLabel = label(1, 1);
    const startingPoints: Label[] = [];

    for (const [line, lineIndex] of indexed(lines)) {
        for (const [char, rowIndex] of indexed(line)) {
            switch (char) {
                case 'S':
                    startLabel = label(rowIndex + 1, lineIndex + 1);
                    startingPoints.push(label(rowIndex + 1, lineIndex + 1));
                    break;
                case 'E':
                    endLabel = label(rowIndex + 1, lineIndex + 1);
                    break;
                case 'a':
                    startingPoints.push(label(rowIndex + 1, lineIndex + 1));
                    break;
            }
        }
    }

    const elevationOf = (letter: string): number => {
        switch (letter) {
            case 'S': return 1;
            case 'E': return 26;
            default: return letter.charCodeAt(0) - 96;
        }
    };

    const elevationMap = lines.map(line => line.map(elevationOf));
    const cols = elevationMap.length;
    const rows = elevationMap[0].length;
    const at = (x: number, y: number) => elevationMap[y - 1][x - 1];
    const g = new Graph<Label>();

    for (const [x, y] of pairs(range(1, rows), range(1, cols))) {
        g.insertVertex(label(x, y));
    }

    for (const [x, y] of pairs(range(1, rows), range(1, cols))) {
        if (x > 1 && at(x, y) - at(x - 1, y) <= 1) {
            g.insertDirectedEdge(label(x, y), label(x - 1, y), 1);
        }

        if (x < rows && at(x, y) - at(x + 1, y) <= 1) {
            g.insertDirectedEdge(label(x, y), label(x + 1, y), 1);
        }

        if (y > 1 && at(x, y) - at(x, y - 1) <= 1) {
            g.insertDirectedEdge(label(x, y), label(x, y - 1), 1);
        }

        if (y < cols && at(x, y) - at(x, y + 1) <= 1) {
            g.insertDirectedEdge(label(x, y), label(x, y + 1), 1);
        }
    }

    return { elevation: g, start: startLabel, end: endLabel, startingPoints };
};

const { elevation, start, end, startingPoints } = buildGraph(parseInput());
const distancesFromEnd = dijkstra(elevation, end);

const part1 = () => distancesFromEnd.get(start)!;
const part2 = () => min(startingPoints.map(start => distancesFromEnd.get(start)!)).value;

run({ part1, part2 });

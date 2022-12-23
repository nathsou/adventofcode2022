import { readFileSync } from "fs";
import { countIters, indexed, range } from "../utils/iterators";
import { run } from "../utils/run";

const DEBUG = false;

type Dir = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
type Pos = { x: number, y: number };
type PosHash = number;

const K = 1000;
const OFFSET = { x: K / 2, y: K / 2 };

const hashPos = (x: number, y: number): PosHash => (OFFSET.x + x) * K + (OFFSET.y + y);

const parsePos = (pos: PosHash): Pos => {
  const x = Math.floor(pos / K) - OFFSET.x;
  const y = pos - (x + OFFSET.x) * K - OFFSET.y;
  return { x, y };
};

type ElfMap = Set<PosHash>;

const parseInput = (): ElfMap => {
  const lines = readFileSync("./input.txt")
    .toString("utf-8")
    .split("\n");

  const map = new Set<PosHash>();

  for (const [line, y] of indexed(lines)) {
    for (const [char, x] of indexed(line)) {
      if (char === "#") {
        map.add(hashPos(x, y));
      }
    }
  }

  return map;
};

const DIR_DELTA: Record<Dir, { x: number, y: number }> = {
  N: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  W: { x: -1, y: 0 },
  NE: { x: 1, y: -1 },
  NW: { x: -1, y: -1 },
  SE: { x: 1, y: 1 },
  SW: { x: -1, y: 1 },
};

const createDirections = () => {
  const directions: { ifFree: Dir[], go: Dir }[] = [
    { ifFree: ['N', 'NE', 'NW'], go: 'N' },
    { ifFree: ['S', 'SE', 'SW'], go: 'S' },
    { ifFree: ['W', 'NW', 'SW'], go: 'W' },
    { ifFree: ['E', 'NE', 'SE'], go: 'E' },
  ];

  const rotate = () => {
    const first = directions.shift()!;
    directions.push(first);
  };

  return { directions, rotate };
};

type RotatedDirections = ReturnType<typeof createDirections>;

const ALL_DIRECTIONS: Dir[] = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];

const proposeMoves = (elves: ElfMap, dirs: RotatedDirections) => {
  const propositionCounts = new Map<PosHash, number>();
  const propositions = new Map<PosHash, PosHash>();

  for (const elf of elves) {
    const { x, y } = parsePos(elf);

    for (const { ifFree, go } of dirs.directions) {
      const completelyFree = ALL_DIRECTIONS.every(dir => {
        const { x: dx, y: dy } = DIR_DELTA[dir];
        return !elves.has(hashPos(x + dx, y + dy));
      });

      if (!completelyFree) {
        if (ifFree.every(dir => {
          const { x: dx, y: dy } = DIR_DELTA[dir];
          return !elves.has(hashPos(x + dx, y + dy));
        })) {
          const delta = DIR_DELTA[go];
          const key = hashPos(x + delta.x, y + delta.y);
          propositionCounts.set(key, (propositionCounts.get(key) ?? 0) + 1);
          propositions.set(elf, key);
          break;
        }
      }
    }
  }

  return { propositions, propositionCounts };
};

const move = (
  propositions: Map<PosHash, PosHash>,
  propositionCounts: Map<PosHash, number>,
  elves: ElfMap,
): boolean => {
  let moved = false;

  for (const [from, to] of propositions) {
    if (propositionCounts.get(to)! < 2) {
      elves.delete(from);
      elves.add(to);
      moved = true;
    }
  }

  return moved;
};

const round = (elves: ElfMap, dirs: RotatedDirections): boolean => {
  const { propositions, propositionCounts } = proposeMoves(elves, dirs);
  const moved = move(propositions, propositionCounts, elves);
  dirs.rotate();
  return moved;
};

type Bounds = { minX: number, maxX: number, minY: number, maxY: number };

const bounds = (elves: ElfMap): Bounds => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const elf of elves) {
    const { x, y } = parsePos(elf);

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return { minX, maxX, minY, maxY };
};

const show = (elves: ElfMap) => {
  const { minX, maxX, minY, maxY } = bounds(elves);
  const lines: string[] = [];

  for (const y of range(minY, maxY + 1)) {
    let line = "";
    for (const x of range(minX, maxX + 1)) {
      line += elves.has(hashPos(x, y)) ? "#" : ".";
    }
    lines.push(line);
  }

  return lines.join('\n');
};

const countEmptyTiles = (elves: ElfMap): number => {
  const { minX, maxX, minY, maxY } = bounds(elves);
  const area = (maxX - minX + 1) * (maxY - minY + 1);
  return area - elves.size;
};

const part1 = () => {
  const elves = parseInput();
  const dirs = createDirections();

  if (DEBUG) {
    console.log(show(elves));
  }

  for (const _ of range(1, 10)) {
    round(elves, dirs);
    if (DEBUG) {
      console.log('-------------------');
      console.log(show(elves));
    }
  }

  return countEmptyTiles(elves);
};

const part2 = () => {
  const elves = parseInput();
  const dirs = createDirections();
  return countIters(() => round(elves, dirs)) + 1;
};

run({ part1, part2 });

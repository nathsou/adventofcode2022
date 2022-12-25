import { readFileSync } from "fs";
import { lcm } from "../utils/functions";
import { run } from "../utils/run";

type Dir = '<' | '>' | '^' | 'v';
type Pos = { x: number, y: number };

const K = 200;
const hash = (x: number, y: number): PosHash => y * K + x;

const parsePos = (pos: PosHash): Pos => {
  const y = Math.floor(pos / K);
  const x = pos - y * K;
  return { x, y };
};

type PosHash = number;
type Blizzard = Map<PosHash, Dir[]>;
type Bounds = { minX: number, maxX: number, minY: number, maxY: number };

type Input = {
  blizzard: Blizzard,
  dims: Bounds
  borders: Set<PosHash>,
  periodicity: number,
  start: Pos,
  end: Pos,
};

const parseInput = (): Input => {
  const blizzard: Blizzard = new Map<PosHash, Dir[]>();
  const borders = new Set<PosHash>();

  const lines = readFileSync('./input.txt')
    .toString("utf-8")
    .split("\n")
    .map(line => line.split(''));

  const dims = { minX: 0, maxX: lines[0].length - 1, minY: 0, maxY: lines.length - 1 };

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === '#') {
        borders.add(hash(x, y));
      } else {
        const dir = lines[y][x] as Dir;
        if (dir === '<' || dir === '>' || dir === '^' || dir === 'v') {
          blizzard.set(hash(x, y), [dir]);
        }
      }
    }
  }

  return {
    blizzard,
    dims,
    borders,
    periodicity: lcm(dims.maxX - 1, dims.maxY - 1),
    start: { x: 1, y: 0 },
    end: { x: dims.maxX - 1, y: dims.maxY },
  };
};

const DIR_DELTA: Record<Dir, { dx: number, dy: number }> = {
  '<': { dx: -1, dy: 0 },
  '>': { dx: 1, dy: 0 },
  '^': { dx: 0, dy: -1 },
  'v': { dx: 0, dy: 1 },
};

const nextPos = (pos: Pos, dir: Dir, dims: Bounds): Pos => {
  const { dx, dy } = DIR_DELTA[dir];
  let x = pos.x + dx;
  let y = pos.y + dy;

  if (x === 0) {
    x = dims.maxX - 1;
  }

  if (x === dims.maxX) {
    x = 1;
  }

  if (y === 0) {
    y = dims.maxY - 1;
  }

  if (y === dims.maxY) {
    y = 1;
  }

  return { x, y };
};

const step = (blizzard: Blizzard, dims: Bounds): Blizzard => {
  const newBlizzard = new Map<PosHash, Dir[]>();

  for (const [pos, dirs] of blizzard) {
    for (const dir of dirs) {
      const next = nextPos(parsePos(pos), dir, dims);
      const nextHash = hash(next.x, next.y);

      if (!newBlizzard.has(nextHash)) {
        newBlizzard.set(nextHash, [dir]);
      } else {
        newBlizzard.get(nextHash)!.push(dir);
      }
    }
  }

  return newBlizzard;
};

const createBlizzardCache = ({ blizzard: startState, periodicity, dims }: Input) => {
  const memo: Blizzard[] = [startState];

  for (let t = 1; t < periodicity; t++) {
    memo.push(step(memo[t - 1], dims));
  }

  return (t: number): Blizzard => {
    return memo[t % periodicity];
  };
};

const ALL_DIRS = [DIR_DELTA['<'], DIR_DELTA['>'], DIR_DELTA['^'], DIR_DELTA['v'], { dx: 0, dy: 0 }];

const search = (
  blizzardAt: (t: number) => Blizzard,
  { dims, periodicity, borders }: Input,
  start: Pos,
  end: Pos,
  t0 = 0,
): number => {
  let bestYet = Infinity;
  const memo = new Set<string>();
  const queue: { t: number, pos: Pos }[] = [{ t: 0, pos: start }];

  while (queue.length > 0) {
    const { pos, t } = queue.shift()!;
    const key = `${pos.x}:${pos.y}:${t % periodicity}`;

    if (memo.has(key)) {
      continue;
    }

    if (pos.x === end.x && pos.y === end.y) {
      if (t < bestYet) {
        bestYet = t;
      }

      return t;
    }

    const blizzard = blizzardAt(t0 + t + 1);

    for (const { dx, dy } of ALL_DIRS) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      const h = hash(x, y);
      if (
        x >= dims.minX &&
        x <= dims.maxX &&
        y >= dims.minY &&
        y <= dims.maxY &&
        !borders.has(h) &&
        !blizzard.has(h)
      ) {
        queue.push({ pos: { x, y }, t: t + 1 });
      }
    }

    memo.add(key);
  }

  return bestYet;
};

const part1 = () => {
  const input = parseInput();
  const blizzardAt = createBlizzardCache(input);
  return search(blizzardAt, input, input.start, input.end);
};

const part2 = () => {
  const input = parseInput();
  const blizzardAt = createBlizzardCache(input);

  const a = search(blizzardAt, input, input.start, input.end);
  const b = search(blizzardAt, input, input.end, input.start, a);
  const c = search(blizzardAt, input, input.start, input.end, a + b);

  return a + b + c;
};

run({ part1, part2 });

import { readFileSync } from "fs";
import { indexed } from "../utils/iterators";
import { run } from "../utils/run";

const USE_SAMPLE = false;

type PosHash = string;

const hash = (x: number, y: number): PosHash => `${x}:${y}`;

class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public walls: Set<PosHash>;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.walls = new Set();
  }
}

type Dir = "N" | "E" | "S" | "W";

const turnLeft = (dir: Dir): Dir => {
  switch (dir) {
    case "N": return "W";
    case "E": return "N";
    case "S": return "E";
    case "W": return "S";
  }
};

const turnRight = (dir: Dir): Dir => {
  switch (dir) {
    case "N": return "E";
    case "E": return "S";
    case "S": return "W";
    case "W": return "N";
  }
};

const DIR_DELTA = {
  "N": { x: 0, y: -1 },
  "E": { x: 1, y: 0 },
  "S": { x: 0, y: 1 },
  "W": { x: -1, y: 0 },
};

const DIR_INDEX = {
  "E": 0,
  "S": 1,
  "W": 2,
  "N": 3,
};

const splitFaces = (rects: Rect[], side: number) => {
  const faces = new Map<number, { minX: number, minY: number, maxX: number, maxY: number }>();

  let currentFace = 1;

  for (const rect of rects) {
    const rectsX = rect.width / side;
    const rectsY = rect.height / side;

    for (let i = 0; i < rectsX; i++) {
      for (let j = 0; j < rectsY; j++) {
        const minX = rect.x + i * side;
        const minY = rect.y + j * side;
        const maxX = minX + side - 1;
        const maxY = minY + side - 1;

        faces.set(currentFace, { minX, minY, maxX, maxY });
        currentFace += 1;
      }
    }
  }

  return faces;
};

// 1 -> top
// 2 -> back
// 3 -> left
// 4 -> front
// 5 -> bottom
// 6 -> right

type CubeFace = 1 | 2 | 3 | 4 | 5 | 6;

const WRAP_FACE_SAMPLE: Record<`${CubeFace}:${Dir}`, { face: CubeFace, dir: Dir }> = {
  "1:E": { face: 6, dir: 'W' },
  "1:N": { face: 2, dir: 'S' },
  "1:W": { face: 3, dir: 'S' },
  "1:S": { face: 4, dir: 'S' },
  "2:E": { face: 3, dir: 'E' },
  "2:N": { face: 1, dir: 'S' },
  "2:W": { face: 6, dir: 'N' },
  "2:S": { face: 5, dir: 'N' },
  "3:E": { face: 4, dir: 'E' },
  "3:N": { face: 1, dir: 'E' },
  "3:W": { face: 2, dir: 'W' },
  "3:S": { face: 5, dir: 'E' },
  "4:E": { face: 6, dir: 'S' },
  "4:N": { face: 1, dir: 'N' },
  "4:W": { face: 3, dir: 'W' },
  "4:S": { face: 5, dir: 'S' },
  "5:E": { face: 6, dir: 'E' },
  "5:N": { face: 4, dir: 'N' },
  "5:W": { face: 3, dir: 'N' },
  "5:S": { face: 2, dir: 'N' },
  "6:E": { face: 1, dir: 'W' },
  "6:N": { face: 4, dir: 'W' },
  "6:W": { face: 5, dir: 'W' },
  "6:S": { face: 2, dir: 'E' },
};

const WRAP_FACE_INPUT: Record<`${CubeFace}:${Dir}`, { face: CubeFace, dir: Dir }> = {
  "1:E": { face: 2, dir: 'E' },
  "1:N": { face: 6, dir: 'E' },
  "1:W": { face: 4, dir: 'E' },
  "1:S": { face: 3, dir: 'S' },
  "2:E": { face: 5, dir: 'W' },
  "2:N": { face: 6, dir: 'N' },
  "2:W": { face: 1, dir: 'W' },
  "2:S": { face: 3, dir: 'W' },
  "3:E": { face: 2, dir: 'N' },
  "3:N": { face: 1, dir: 'N' },
  "3:W": { face: 4, dir: 'S' },
  "3:S": { face: 5, dir: 'S' },
  "4:E": { face: 5, dir: 'E' },
  "4:N": { face: 3, dir: 'E' },
  "4:W": { face: 1, dir: 'E' },
  "4:S": { face: 6, dir: 'S' },
  "5:E": { face: 2, dir: 'W' },
  "5:N": { face: 3, dir: 'N' },
  "5:W": { face: 4, dir: 'W' },
  "5:S": { face: 6, dir: 'W' },
  "6:E": { face: 5, dir: 'N' },
  "6:N": { face: 4, dir: 'N' },
  "6:W": { face: 1, dir: 'S' },
  "6:S": { face: 2, dir: 'S' },
};

const WRAP_FACE = USE_SAMPLE ? WRAP_FACE_SAMPLE : WRAP_FACE_INPUT;

const SIDE = USE_SAMPLE ? 4 : 50;

const rotate90Degrees = (x: number, y: number): { x: number, y: number } => {
  return { x: SIDE - 1 - y, y: x };
};

const rotate180Degrees = (x: number, y: number): { x: number, y: number } => {
  return { x: SIDE - 1 - x, y: SIDE - 1 - y };
};

const rotate270Degrees = (x: number, y: number): { x: number, y: number } => {
  return { x: y, y: SIDE - 1 - x };
};

const rotatePos = (x: number, y: number, startDir: Dir, endDir: Dir): { x: number, y: number } => {
  const startIdx = DIR_INDEX[startDir];
  const endIdx = DIR_INDEX[endDir];

  switch (endIdx - startIdx) {
    case 0: return { x, y }; // 0 degrees
    case 1: return rotate90Degrees(x, y); // 90 degrees
    case 2: return rotate180Degrees(x, y); // 180 degrees
    case 3: return rotate270Degrees(x, y); // 270 degrees
    case -1: return rotate270Degrees(x, y); // -90 degrees
    case -2: return rotate180Degrees(x, y); // -180 degrees
    case -3: return rotate90Degrees(x, y); // -270 degrees
    default: throw new Error("Invalid rotation");
  }
};

const rem = (x: number, m: number) => {
  if (x < 0) {
    return m - 1 - ((-x - 1) % m);
  } else {
    return x % m;
  }
};

class Field {
  public x: number;
  public y: number;
  public dir: Dir;
  public rects: Rect[];
  public faces: Map<number, { minX: number, minY: number, maxX: number, maxY: number }>;
  public isCube = true;

  constructor(rects: Rect[]) {
    this.rects = rects;
    this.x = rects[0].x;
    this.y = rects[0].y;
    this.dir = "E";
    this.faces = splitFaces(rects, SIDE);
  }

  horizontalBoundsAt(y: number): { minX: number, maxX: number } {
    const rect = this.rects.find(rect => rect.y <= y && y < rect.y + rect.height)!;
    return { minX: rect.x, maxX: rect.x + rect.width - 1 };
  }

  verticalBoundsAt(x: number, y: number): { minY: number, maxY: number } {
    const idx = this.rects.findIndex(rect => rect.x <= x && x < rect.x + rect.width && rect.y <= y && y < rect.y + rect.height)!;

    if (idx === -1) {
      throw new Error(`invalid position: ${x}, ${y}`);
    }

    let minY = this.rects[idx].y;
    let maxY = this.rects[idx].y + this.rects[idx].height;

    for (let i = idx; i < this.rects.length; i++) {
      const rect = this.rects[i];
      if (x >= rect.x && x < rect.x + rect.width) {
        maxY = rect.y + rect.height;
      } else {
        break;
      }
    }

    for (let i = idx - 1; i >= 0; i--) {
      const rect = this.rects[i];
      if (x >= rect.x && x < rect.x + rect.width) {
        minY = rect.y;
      } else {
        break;
      }
    }

    return { minY, maxY: maxY - 1 };
  }

  faceAt(x: number, y: number): number {
    for (const [face, { minX, minY, maxX, maxY }] of this.faces) {
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        return face;
      }
    }

    throw new Error(`invalid position: ${x}, ${y}`);
  }

  prevDir: Dir = 'E';

  private index = 0;

  wrapAroundCube(x: number, y: number, dir: Dir): { x: number, y: number, nextDir: Dir } {
    const faceId = this.faceAt(x, y);
    const { minX, maxX, minY, maxY } = this.faces.get(faceId)!;
    const { x: dx, y: dy } = DIR_DELTA[dir];

    if (x + dx < minX || x + dx > maxX || y + dy < minY || y + dy > maxY) {
      const { face: nextFace, dir: nextDir } = WRAP_FACE[`${faceId}:${dir}` as `${CubeFace}:${Dir}`];
      let newX = rem(x + dx, SIDE);
      let newY = rem(y + dy, SIDE);

      const { x: rotatedX, y: rotatedY } = rotatePos(newX, newY, dir, nextDir);
      const { minX: nextMinX, minY: nextMinY } = this.faces.get(nextFace)!;

      const nextX = nextMinX + rotatedX;
      const nextY = nextMinY + rotatedY;

      return { x: nextX, y: nextY, nextDir };
    }

    return { x: x + dx, y: y + dy, nextDir: dir };
  }

  wrapAround(x: number, y: number, dir: Dir): { x: number, y: number, nextDir: Dir } {
    const { x: dx, y: dy } = DIR_DELTA[dir];
    const { minX, maxX } = this.horizontalBoundsAt(y);
    const { minY, maxY } = this.verticalBoundsAt(x, y);

    if (x + dx > maxX) {
      return { x: minX, y, nextDir: dir };
    }

    if (x + dx < minX) {
      return { x: maxX, y, nextDir: dir };
    }

    if (y + dy < minY) {
      return { x, y: maxY, nextDir: dir };
    }

    if (y + dy > maxY) {
      return { x, y: minY, nextDir: dir };
    }

    return { x: x + dx, y: y + dy, nextDir: dir };
  }

  isWall(x: number, y: number): boolean {
    const rect = this.rects.find(
      rect => rect.x <= x && x < rect.x + rect.width && rect.y <= y && y < rect.y + rect.height
    )!;

    if (!rect) {
      return false;
    }

    return rect.walls.has(hash(x, y));
  }

  move(steps: number, isCube: boolean): void {
    for (let i = 0; i < steps; i++) {
      const { x, y, nextDir } = isCube ?
        this.wrapAroundCube(this.x, this.y, this.dir) :
        this.wrapAround(this.x, this.y, this.dir);

      if (this.isWall(x, y)) {
        break;
      }

      this.x = x;
      this.y = y;
      this.dir = nextDir;
    }
  }

  turn(dir: "L" | "R"): void {
    this.dir = dir === "L" ? turnLeft(this.dir) : turnRight(this.dir);
  }
}

const lineWidth = (line: string) => line.trim().length;
const lineStart = (line: string) => Math.min(line.indexOf("#"), line.indexOf("."));

type Command = { type: "forward", steps: number } | { type: "turn", direction: "L" | "R" };

const parseMoves = (moves: string) => {
  const res: Command[] = [];
  let steps = 0;

  for (let i = 0; i < moves.length; i++) {
    const c = moves[i];

    if (c === 'L') {
      res.push({ type: 'turn', direction: "L" });
    } else if (c === 'R') {
      res.push({ type: 'turn', direction: "R" });
    } else if (c >= '0' && c <= '9') {
      steps = steps * 10 + parseInt(c, 10);
      if (i === moves.length - 1 || moves[i + 1] === 'L' || moves[i + 1] === 'R') {
        res.push({ type: 'forward', steps });
        steps = 0;
      }
    }
  }

  return res;
};

const parseInput = (): [Field, Command[]] => {
  let [field, moves] = readFileSync(USE_SAMPLE ? "./sample.txt" : "./input.txt")
    .toString("utf-8")
    .split("\n\n");

  const lines = field.split("\n");
  const rects: Rect[] = [new Rect(lineStart(lines[0]), 0, lineWidth(lines[0]), 0)];

  for (const [line, y] of indexed(lines)) {
    const width = lineWidth(line);
    let rect = rects.at(-1)!;
    if (width !== rect.width) {
      const height = y - rect.y;
      rect.height = height;
      rects.push(new Rect(lineStart(line), y, width, 0));
      rect = rects.at(-1)!;
    }

    for (const [char, x] of indexed(line)) {
      if (char === "#") {
        rect.walls.add(hash(x, y));
      }
    }
  }

  rects.at(-1)!.height = lines.length - rects.at(-1)!.y;

  return [new Field(rects), parseMoves(moves)];
};

const solve = (isPart2: boolean): number => {
  const [field, moves] = parseInput();
  for (const move of moves) {
    if (move.type === "forward") {
      field.move(move.steps, isPart2);
    } else {
      field.turn(move.direction);
    }
  }

  const col = field.x + 1;
  const row = field.y + 1;

  return row * 1000 + 4 * col + DIR_INDEX[field.dir];
};

const part1 = () => solve(false);
const part2 = () => solve(true);

run({ part1, part2 });

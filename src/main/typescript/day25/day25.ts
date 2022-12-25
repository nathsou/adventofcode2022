import { readFileSync } from "fs";
import { fill, reverse, sum } from "../utils/iterators";
import { run } from "../utils/run";

type Digit = '2' | '1' | '0' | '-' | '=';

const digitMapping: Record<Digit, number> = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
};

const parseDigits = (line: string): Digit[] => {
  return line.split('') as Digit[];
};

const parseInput = (): Digit[][] => {
  return readFileSync('./input.txt')
    .toString("utf-8")
    .split("\n")
    .map(parseDigits);
};

const toDecimal = (ds: Digit[]): number => {
  let multiplier = 1;
  let result = 0;

  for (const d of reverse(ds)) {
    result += digitMapping[d] * multiplier;
    multiplier *= 5;
  }

  return result;
};

const toBase5 = (n: number) => {
  return n.toString(5).split('').map(Number) as (0 | 1 | 2 | 3 | 4)[];
};

const add = (a: Digit, b: 0 | 1 | 2 | 3 | 4, carry: Digit): { carry: Digit, sum: Digit } => {
  const sum = digitMapping[a] + b + digitMapping[carry];

  switch (sum) {
    case 5: return { carry: '1', sum: '0' };
    case 4: return { carry: '1', sum: '-' };
    case 3: return { carry: '1', sum: '=' };
    case 2: return { carry: '0', sum: '2' };
    case 1: return { carry: '0', sum: '1' };
    case 0: return { carry: '0', sum: '0' };
    case -1: return { carry: '0', sum: '-' };
    case -2: return { carry: '0', sum: '=' };
    default: throw new Error(`Invalid sum ${sum}`);
  }
};

const toSNAFU = (n: number): Digit[] => {
  const base5 = toBase5(n);
  const snafu = [...fill<Digit>('0', base5.length)];
  let carryIn: Digit = '0';

  for (let i = base5.length - 1; i >= 0; i--) {
    const digit = base5[i];
    const { carry, sum } = add(snafu[i], digit, carryIn);
    snafu[i] = sum;
    carryIn = carry;
  }

  return carryIn === '0' ? snafu : [carryIn, ...snafu];
};

const part1 = (): string => {
  const numbers = parseInput();
  const total = sum(numbers.map(toDecimal));
  return toSNAFU(total).join('');
};

// no part 2 for this day :)

run({ part1 });

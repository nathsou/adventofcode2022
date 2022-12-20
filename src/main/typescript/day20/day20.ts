import { readFileSync } from "fs";
import { indexed, map, range, repeat, sum } from "../utils/iterators";
import { run } from "../utils/run";

const parseInput = (): number[] => {
  return readFileSync("./input.txt")
    .toString("utf-8")
    .split("\n")
    .map(Number);
};

const move = (input: [number, number][], index: number): void => {
  const i = input.findIndex(([_, i]) => i === index);
  const [[n, i2]] = input.splice(i, 1);
  const newIndex = (i + n) % input.length;
  input.splice(newIndex, 0, [n, i2]);
};

const mix = (indexedInput: [number, number][], count: number) => {
  for (const index of repeat(range(0, indexedInput.length - 1), count)) {
    move(indexedInput, index);
  }
};

const at = (indexedInput: [number, number][]) => {
  const indexOfZero = indexedInput.findIndex(([n, _]) => n === 0);
  return (index: number) => (indexedInput[(indexOfZero + index) % indexedInput.length])[0];
};

const part1 = () => {
  const input = parseInput();
  const indexedInput = [...indexed(input)];
  mix(indexedInput, 1);
  return sum(map([1000, 2000, 3000], at(indexedInput)));
};

const part2 = () => {
  const input = parseInput();
  const key = 811589153;
  const indexedInput = [...indexed(input.map(n => n * key))];
  mix(indexedInput, 10);
  return sum(map([1000, 2000, 3000], at(indexedInput)));
};

run({ part1, part2 });

import { readFileSync } from 'fs';
import { DataType, match } from 'itsamatch';
import { chunks, fill, map, range, sum } from '../utils/iterators';
import { run } from '../utils/run';

type Instruction = DataType<{
    Noop: {},
    AddX: { value: number },
}>;

const Instruction = {
    parse: (line: string): Instruction => {
        if (line === 'noop') {
            return { variant: 'Noop' };
        }

        return { variant: 'AddX', value: Number(line.split(' ')[1]) };
    },
    interpret: (instruction: Instruction, state: State): number => {
        return match(instruction, {
            AddX: ({ value }) => {
                state.cycles += 2;
                state.X += value;
                return 2;
            },
            Noop: () => {
                state.cycles += 1;
                return 1;
            },
        });
    },
};

type Cycle = number;
type State = { X: number, cycles: Cycle };
type StateHistory = Map<Cycle, number>;

const parseInput = () => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(Instruction.parse);
};

const State = {
    make: (): State => ({ X: 1, cycles: 1 }),
    at: (cycle: number, history: StateHistory): number => {
        for (const n of range(cycle, 0)) {
            if (history.has(n)) {
                return history.get(n)!;
            }
        }

        return -1;
    },
};

const part1 = () => {
    const instructions = parseInput();
    const state = State.make();
    const history = new Map<number, number>();

    history.set(1, state.X);

    for (const inst of instructions) {
        Instruction.interpret(inst, state);
        history.set(state.cycles, state.X)
    }

    return sum([20, 60, 100, 140, 180, 220].map(n => State.at(n, history) * n));
};

const isSpriteVisible = (position: number, cycle: number) => {
    return Math.abs(position - (cycle % 40)) < 2;
};

const part2 = () => {
    const instructions = parseInput();
    const state = State.make();
    const screen = [...fill('.', 40 * 6)];

    let pixel = 0;

    for (const inst of instructions) {
        const X = state.X;
        const instCycles = Instruction.interpret(inst, state);
        for (let i = 0; i < instCycles; i++) {
            if (isSpriteVisible(X, pixel)) {
                screen[pixel] = '#';
            }

            pixel += 1;
        }
    }

    return [...map(chunks(screen, 40), line => line.join(''))].join('\n');
};

run({ part1, part2: () => '\n' + part2() });
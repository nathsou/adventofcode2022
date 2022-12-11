import { readFileSync } from 'fs';
import { range, take, prod, map, chunks } from '../utils/iterators';
import { run } from '../utils/run';

type Monkey = {
    id: number,
    items: number[],
    operation: { lhs: (number | 'old'), op: '+' | '*', rhs: (number | 'old') },
    divisbilityTest: number,
    ifTrue: number,
    ifFalse: number,
    inspections: number,
};

const parseMonkey = (lines: string[]): Monkey => {
    const [id, items, operation, divisbilityTest, ifTrue, ifFalse] = lines;
    const [lhs, rhs] = operation.split('new = ')[1].replaceAll(' ', '').split(/[\+\*]/);

    return {
        id: parseInt(id.split(' ')[1]),
        items: items.split(':')[1].trim().split(', ').map(n => Number(n)),
        operation: {
            lhs: lhs === 'old' ? 'old' : Number(lhs),
            op: operation.includes('+') ? '+' : '*',
            rhs: rhs === 'old' ? 'old' : Number(rhs),
        },
        divisbilityTest: Number(divisbilityTest.split('by ')[1]),
        ifTrue: Number(ifTrue[ifTrue.length - 1]),
        ifFalse: Number(ifFalse[ifFalse.length - 1]),
        inspections: 0,
    };
};

const parseInput = (): Monkey[] => {
    const lines = readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .filter(l => l.length > 0);

    return [...map(chunks(lines, 6), parseMonkey)];
};

const evaluateOperation = ({ lhs, op, rhs }: Monkey['operation'], old: number): number => {
    const left = lhs === 'old' ? old : lhs;
    const right = rhs === 'old' ? old : rhs;

    switch (op) {
        case '+': return left + right;
        case '*': return left * right;
    }
};

const takeTurn = (monkeys: Monkey[], monkey: Monkey, divideBy3: boolean): void => {
    const prodDivisibilityTests = prod(monkeys.map(m => m.divisbilityTest));

    while (monkey.items.length > 0) {
        monkey.inspections += 1;
        const worryLevel = monkey.items.shift()!;
        let newLevel = evaluateOperation(monkey.operation, worryLevel) % prodDivisibilityTests;

        if (divideBy3) {
            newLevel = Math.floor(newLevel / 3);
        }

        if (newLevel % monkey.divisbilityTest === 0) {
            monkeys[monkey.ifTrue].items.push(newLevel);
        } else {
            monkeys[monkey.ifFalse].items.push(newLevel);
        }
    }
};

const round = (monkeys: Monkey[], divideBy3: boolean): void => {
    for (const monkey of monkeys) {
        takeTurn(monkeys, monkey, divideBy3);
    }
};

const monkeyBusinessLevel = (monkeys: Monkey[]): number => {
    return prod(take(monkeys.map(m => m.inspections).sort((a, b) => b - a), 2));
}

const part1 = (): number => {
    const monkeys = parseInput();
    for (const _ of range(1, 20)) {
        round(monkeys, true);
    }

    return monkeyBusinessLevel(monkeys);
};

const part2 = (): number => {
    const monkeys = parseInput();
    for (const _ of range(1, 10_000)) {
        round(monkeys, false);
    }

    return monkeyBusinessLevel(monkeys);
};

run({ part1, part2 });

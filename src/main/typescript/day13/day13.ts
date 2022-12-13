import { readFileSync } from 'fs';
import { filter, indexed, map, sum } from '../utils/iterators';
import { run } from '../utils/run';

type Packet = number | Packet[];
type Order = 'less' | 'greater' | 'equal';

const parsePacket = (packet: string): Packet => JSON.parse(packet);

const parseInput = (): [Packet, Packet][] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .trim()
        .split('\n\n')
        .map(pair => pair.split('\n'))
        .map(([left, right]) => [parsePacket(left), parsePacket(right)]);
};

const comparePackets = (left: Packet, right: Packet): Order => {
    if (typeof left === 'number' && typeof right === 'number') {
        if (left < right) {
            return 'less';
        }

        if (left > right) {
            return 'greater';
        }

        return 'equal';
    }

    if (Array.isArray(left) && Array.isArray(right)) {
        for (let i = 0; i < Math.min(left.length, right.length); i++) {
            switch (comparePackets(left[i], right[i])) {
                case 'less': return 'less';
                case 'greater': return 'greater';
                case 'equal': break;
            }
        }

        if (left.length < right.length) {
            return 'less';
        }

        if (left.length > right.length) {
            return 'greater';
        }

        return 'equal';
    }

    if (Array.isArray(left) && typeof right === 'number') {
        return comparePackets(left, [right]);
    }

    if (typeof left === 'number' && Array.isArray(right)) {
        return comparePackets([left], right);
    }

    throw 'unreachable';
};

const part1 = () => {
    const pairs = parseInput();
    return sum(
        map(
            filter(indexed(pairs), ([[l, r]]) => comparePackets(l, r) === 'less'),
            ([_, index]) => index + 1
        )
    );
};

const ORDER_MAPPING: Record<Order, number> = { less: -1, greater: 1, equal: 0 };

const showPacket = (packet: Packet): string => {
    if (Array.isArray(packet)) {
        return `[${packet.map(showPacket).join(', ')}]`;
    }

    return `${packet}`;
};

const part2 = () => {
    const pairs = parseInput().flat();
    pairs.push([[2]], [[6]]);
    const sorted = pairs.sort((a, b) => ORDER_MAPPING[comparePackets(a, b)]).map(showPacket);
    return (sorted.indexOf('[[2]]') + 1) * (sorted.indexOf('[[6]]') + 1);
};

run({ part1, part2 });

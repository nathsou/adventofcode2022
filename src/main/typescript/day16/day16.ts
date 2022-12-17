import { readFileSync } from 'fs';
import { floydWarshall, Graph } from '../utils/graphs';
import { max } from '../utils/iterators';
import { run } from '../utils/run';

type Valve = {
    name: string;
    flowRate: number;
    tunnels: string[];
};

const parseInput = (): Valve[] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => {
            const [_, name, flowRate, tunnels] = line.match(/Valve (?<valve>\w+) has flow rate=(?<flowRate>\d+); tunnels? leads? to valves? (?<tunnels>.+)/)!.values();
            return {
                name,
                flowRate: Number(flowRate),
                tunnels: tunnels.split(', '),
            };
        });
};

// const maxFlow = (
//     valve: Valve,
//     valves: Map<string, Valve>,
//     openedValves: Set<string>,
//     visitedValves: Set<string>,
//     remainingMinutes: number,
//     totalFlow: number,
// ): number => {
//     // console.log(`Visiting ${valve.name} at ${remainingMinutes} minutes left, total flow ${totalFlow}, opened ${[...openedValves]}`);
//     if (remainingMinutes <= 0 || openedValves.size === valves.size) {
//         return 0;
//     }

//     const visitWithoutOpening = max(valve.tunnels.map(name =>
//         name === valve.name ? 0 :
//             maxFlow(
//                 valves.get(name)!,
//                 valves,
//                 new Set(openedValves),
//                 new Set([...visitedValves, valve.name]),
//                 remainingMinutes - 1,
//                 totalFlow
//             )
//     ));

//     if (openedValves.has(valve.name)) {
//         return totalFlow + visitWithoutOpening.value;
//     }

//     const openAndVisit = max(valve.tunnels.map(name =>
//         name === valve.name ? 0 :
//             maxFlow(
//                 valves.get(name)!,
//                 valves,
//                 new Set([...openedValves, valve.name]),
//                 new Set([...visitedValves, valve.name]),
//                 remainingMinutes - 2,
//                 totalFlow + (remainingMinutes - 1) * valve.flowRate
//             )
//     ));

//     if (openAndVisit.value > visitWithoutOpening.value) {
//         console.log(`Opening ${valve.name} at ${remainingMinutes} minutes left ${Math.max(visitWithoutOpening.value, openAndVisit.value)}`);
//     }

//     return totalFlow + Math.max(visitWithoutOpening.value, openAndVisit.value);
// };

// const openValves = (valves: Valve[]) => {
//     const valvesByName = groupByUnique(valves, valve => valve.name);
//     return maxFlow(valvesByName.get('AA')!, valvesByName, new Set(), new Set(), 30, 0);
// };

const buildGraph = (valves: Valve[]) => {
    const flow = new Map<string, any>();
    const g = new Graph<string>();

    for (const valve of valves) {
        g.insertVertex(valve.name);
        if (valve.flowRate !== 0) {
            flow.set(valve.name, valve.flowRate);
        }

        for (const tunnel of valve.tunnels) {
            g.insertDirectedEdge(tunnel, valve.name, 1);
        }
    }

    return { g, flow };
};

const hash = (t: number, valve: string, closedValves: string[], withHelp: boolean) => {
    return `${t}:${valve}:${[...closedValves].sort().join(',')}:${withHelp}`;
};

const traverse = (
    time: number,
    dists: Map<string, number>,
    flow: Map<string, number>,
    withElephant: boolean
): number => {
    const memo = new Map<string, number>();

    const go = (t: number, valve: string, closedValves: string[], withElephant = false): number => {
        const key = hash(t, valve, closedValves, withElephant);
        if (memo.has(key)) {
            return memo.get(key)!;
        }

        const candidates: number[] = [0];

        for (const v of closedValves) {
            const d = dists.get(`${valve} -> ${v}`) ?? Infinity;
            if (d < t) {
                const remainingMinutes = t - d - 1;
                candidates.push(
                    flow.get(v)! * remainingMinutes +
                    go(remainingMinutes, v, [...closedValves].filter(x => x !== v), withElephant)
                );
            }
        }

        if (withElephant) {
            candidates.push(go(26, 'AA', closedValves));
        }

        const res = max(candidates).value;
        memo.set(key, res);

        return res;
    };

    return go(time, 'AA', [...flow.keys()], withElephant);
};

const part1 = () => {
    const valves = parseInput();
    const { g, flow } = buildGraph(valves);
    const dists = floydWarshall(g);

    return traverse(30, dists, flow, false);
};

const part2 = () => {
    const valves = parseInput();
    const { g, flow } = buildGraph(valves);
    const dists = floydWarshall(g);
    return traverse(26, dists, flow, true);
};

run({ part1, part2 });

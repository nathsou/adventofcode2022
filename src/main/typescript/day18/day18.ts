import { readFileSync } from 'fs';
import { count, filter, It, sum } from '../utils/iterators';
import { run } from '../utils/run';

type Vec3 = { x: number, y: number, z: number };

const parseInput = (): Vec3[] => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .map(line => {
            let [x, y, z] = line.split(',').map(Number);
            return { x, y, z };
        });
};

const hash = (x: number, y: number, z: number) => `${x}:${y}:${z}`;

type Dims = { minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number };

const getDimensions = (cubes: Vec3[]): Dims => ({
    minX: Math.min(...cubes.map(({ x }) => x)),
    maxX: Math.max(...cubes.map(({ x }) => x)),
    minY: Math.min(...cubes.map(({ y }) => y)),
    maxY: Math.max(...cubes.map(({ y }) => y)),
    minZ: Math.min(...cubes.map(({ z }) => z)),
    maxZ: Math.max(...cubes.map(({ z }) => z)),
});

const countCulledFaces = (cubeList: Vec3[]): number => {
    const cubes = new Set(cubeList.map(({ x, y, z }) => hash(x, y, z)));
    let culledFaces = 0;

    for (const { x, y, z } of cubeList) {
        const top = hash(x, y + 1, z);
        const bottom = hash(x, y - 1, z);
        const left = hash(x - 1, y, z);
        const right = hash(x + 1, y, z);
        const front = hash(x, y, z + 1);
        const back = hash(x, y, z - 1);

        culledFaces += count(
            [top, bottom, left, right, front, back],
            cube => cubes.has(cube)
        );
    }

    return culledFaces;
};

const neighbors = ({ x, y, z }: Vec3, cubes: Set<string>, dims: Dims): It<Vec3> => {
    const isInBounds = (x: number, y: number, z: number) => {
        return x >= dims.minX - 1 && x <= dims.maxX + 1
            && y >= dims.minY - 1 && y <= dims.maxY + 1
            && z >= dims.minZ - 1 && z <= dims.maxZ + 1;
    };

    return filter([
        { x: x - 1, y, z },
        { x: x + 1, y, z },
        { x, y: y - 1, z },
        { x, y: y + 1, z },
        { x, y, z: z - 1 },
        { x, y, z: z + 1 },
    ],
        ({ x, y, z }) => isInBounds(x, y, z) && !cubes.has(hash(x, y, z))
    );
};

// BFS
const facesReachableByWater = (cubes: Set<string>, dims: Dims): Set<string> => {
    const queue: Vec3[] = [{ x: dims.maxX, y: dims.maxY, z: dims.maxZ }];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { x, y, z } = queue.shift()!;
        if (!visited.has(hash(x, y, z))) {
            visited.add(hash(x, y, z));

            for (const neighbor of neighbors({ x, y, z }, cubes, dims)) {
                if (!visited.has(hash(neighbor.x, neighbor.y, neighbor.z))) {
                    queue.push(neighbor);
                }
            }
        }
    }

    return visited;
};

const part1 = () => {
    const cubes = parseInput();
    return 6 * cubes.length - countCulledFaces(cubes);
};

const part2 = () => {
    const cubeList = parseInput();
    const cubes = new Set(cubeList.map(({ x, y, z }) => hash(x, y, z)));
    const dims = getDimensions(cubeList);
    const reachable = facesReachableByWater(cubes, dims);

    return sum(cubeList.map(
        cube => count(neighbors(cube, cubes, dims), ({ x, y, z }) => reachable.has(hash(x, y, z)))
    ));
};

run({ part1, part2 });

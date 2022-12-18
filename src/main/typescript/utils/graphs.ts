import { Heap } from "./heaps";

export class Graph<Label = string> {
    private adjacencyLists: Map<Label, Set<Label>>;
    private costs: Map<string, number>;

    constructor() {
        this.adjacencyLists = new Map();
        this.costs = new Map();
    }

    public insertVertex(label: Label): void {
        if (!this.adjacencyLists.has(label)) {
            this.adjacencyLists.set(label, new Set());
        }
    }

    public hasVertex(label: Label): boolean {
        return this.adjacencyLists.has(label);
    }

    public getVertices(): Label[] {
        return [...this.adjacencyLists.keys()];
    }

    public insertDirectedEdge(a: Label, b: Label, cost = 0): void {
        this.adjacencyLists.get(a)?.add(b);
        this.costs.set(`${a} -> ${b}`, cost);
    }

    public insertUndirectedEdge(a: Label, b: Label, cost = 0): void {
        this.insertDirectedEdge(a, b, cost);
        this.insertDirectedEdge(b, a, cost);
    }

    public isAdjacent(a: Label, b: Label): boolean {
        return this.adjacencyLists.get(a)!.has(b);
    }

    public adjacentVertices(a: Label): Readonly<Set<Label>> {
        return this.adjacencyLists.get(a)!;
    }

    public getCost(a: Label, b: Label): number {
        return this.costs.get(`${a} -> ${b}`) ?? Infinity;
    }
}

// single-source shortest paths
export const dijkstra = <Label = string>(g: Graph<Label>, source: Label) => {
    const unvisited = new Heap<Label, number>(
        g.getVertices().map(v => [v, v === source ? 0 : Infinity]),
        (a, b) => a < b
    );

    const visited = new Set<Label>();
    const distances = new Map<Label, number>(unvisited.getData());

    while (!unvisited.empty()) {
        const [u, d] = unvisited.removeHighestPriority();
        if (d === Infinity) break;

        for (const v of g.adjacentVertices(u)) {
            if (!visited.has(v)) {
                const newDist = d + g.getCost(u, v);
                if (newDist < distances.get(v)!) {
                    distances.set(v, newDist);
                    unvisited.updatePriority(v, newDist);
                }
            }
        }

        visited.add(u);
    }

    return distances;
};

// all-pairs shortest paths
export const floydWarshall = <Label extends string | number>(g: Graph<Label>) => {
    const dists = new Map<`${Label} -> ${Label}`, number>();

    for (const v of g.getVertices()) {
        for (const u of g.getVertices()) {
            dists.set(`${u} -> ${v}`, g.getCost(u, v));
        }
    }

    for (const k of g.getVertices()) {
        for (const i of g.getVertices()) {
            for (const j of g.getVertices()) {
                const ikj = (dists.get(`${i} -> ${k}`) ?? Infinity) + (dists.get(`${k} -> ${j}`) ?? Infinity);
                if (ikj < (dists.get(`${i} -> ${j}`) ?? Infinity)) {
                    dists.set(`${i} -> ${j}`, ikj);
                }
            }
        }
    }

    return dists;
};

export const bfs = <Label = string>(g: Graph<Label>, source: Label): Set<Label> => {
    const queue = [source];
    const visited = new Set<Label>();

    while (queue.length > 0) {
        const u = queue.shift()!;
        if (!visited.has(u)) {
            visited.add(u);
            for (const v of g.adjacentVertices(u)) {
                queue.push(v);
            }
        }
    }

    return visited;
};

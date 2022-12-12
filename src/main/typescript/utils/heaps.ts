export type PartialOrder<T> = (a: T, b: T) => boolean;

export class Heap<K, V> {
    private data: Array<[K, V]>;
    private indices: Map<K, number>;
    private len: number;
    private cmp: PartialOrder<[K, V]>;

    constructor(data: Array<[K, V]> = [], cmp: PartialOrder<V> = (a, b) => a > b) {
        this.data = data;
        this.indices = new Map(data.map(([key], idx) => [key, idx]));
        this.len = data.length;
        this.cmp = ([, a], [, b]) => cmp(a, b);
        this.buildHeap();
    }

    private buildHeap(): void {
        if (this.len === 0) return;

        for (let i = Math.floor(this.len / 2); i >= 0; i--) {
            this.heapifyDown(i);
        }
    }

    private parent(idx: number): number {
        return Math.floor(idx / 2);
    }

    private leftChild(idx: number): number {
        return idx * 2;
    }

    private rightChild(idx: number): number {
        return idx * 2 + 1;
    }

    private swap(a: number, b: number): void {
        const [keyA] = this.data[a];
        const [keyB] = this.data[b];

        [this.data[a], this.data[b]] = [this.data[b], this.data[a]];
        this.indices.set(keyA, b);
        this.indices.set(keyB, a);
    }

    public heapifyUp(idx: number): void {
        if (idx === 0) return;

        if (this.cmp(this.data[idx], this.data[this.parent(idx)])) {
            this.swap(idx, this.parent(idx));
            this.heapifyUp(this.parent(idx));
        }
    }

    public empty(): boolean {
        return this.len === 0;
    }

    private isLeaf(idx: number): boolean {
        return idx >= Math.floor(this.len / 2);
    }

    private maxChild(idx: number): number {
        const left = this.leftChild(idx);
        const right = this.rightChild(idx);

        return this.cmp(this.data[left], this.data[right]) ? left : right;
    }

    public heapifyDown(idx: number): void {
        if (this.isLeaf(idx)) return;

        const maxChild = this.maxChild(idx);

        if (this.cmp(this.data[maxChild], this.data[idx])) {
            this.swap(idx, maxChild);
            this.heapifyDown(maxChild);
        }
    }

    public insert(key: K, value: V): void {
        const index = this.len;
        this.data.push([key, value]);
        this.indices.set(key, index);
        this.heapifyUp(index);
        this.len++;
    }

    public removeHighestPriority(): [K, V] {
        const max = this.data[0];
        this.len--;
        this.data[0] = this.data.pop()!;
        this.indices.set(this.data[0][0], 0);
        this.indices.delete(max[0]);
        this.heapifyDown(0);

        return max;
    }

    public updatePriority(key: K, newPriority: V): void {
        const index = this.indices.get(key)!;
        const [, prevPriority] = this.data[index];
        this.data[index][1] = newPriority;

        if (newPriority < prevPriority) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }
    }

    public getData(): Array<[K, V]> {
        return this.data;
    }
}
export type It<T> = IterableIterator<T>;
export type II<T> = It<T> | T[] | Set<T>;
export type Num = number | bigint;

export function* indexed<T>(iter: Iterable<T>): It<[T, number]> {
	let i = 0;
	for (const elem of iter) {
		yield [elem, i++];
	}
}

export const iter = <T>(it: II<T>): It<T> => {
	return it[Symbol.iterator]();
};

export function* map<U, V>(
	iter: Iterable<U>,
	fn: (val: U) => V,
): It<V> {
	for (const val of iter) {
		yield fn(val);
	}
}

export function* flatMap<U, V>(
	iter: Iterable<U>,
	fn: (val: U) => Iterable<V>,
): It<V> {
	for (const val of iter) {
		yield* fn(val);
	}
}

export function* take<T>(iterable: II<T>, count: number): It<T> {
	const it = iter(iterable);
	for (let i = 0; i < count; i++) {
		const { value, done } = it.next();
		if (done) {
			break;
		} else {
			yield value;
		}
	}
}

export function* takeWhile<T>(iterable: II<T>, pred: (a: T) => boolean): It<T> {
	const it = iter(iterable);
	for (; ;) {
		const { value, done } = it.next();
		if (!pred(value)) break;
		yield value;
		if (done) break;
	}
}

export function* takeAt<T>(it: II<T>, indices: number[]): It<T> {
	const idxs = [...new Set(indices)].sort((a, b) => b - a);
	let next = idxs.pop();

	for (const [val, i] of indexed(it)) {
		if (i === next) {
			yield val;
			if (idxs.length === 0) break;
			next = idxs.pop();
		}
	}
}

export function nth<T>(iterable: II<T>, n: number): T | null {
	const it = iter(iterable);
	let current = null, i = 0;

	for (; i < n; i++) {
		const { value, done } = it.next();
		current = value;
		if (done) break;
	}

	return i === n ? current : null;
}

export function* repeat<T>(it: II<T>, n: number): It<T> {
	const vals = [...it];
	for (let i = 0; i < n; i++) {
		yield* vals;
	}
}

export function* cycle<T>(it: II<T>): It<T> {
	const vals = [...it];
	while (true) {
		yield* vals;
	}
}

export function* skip<T>(
	iterable: II<T>,
	skipCount: number,
): It<T> {
	const it = iter(iterable);

	for (let i = 0; i < skipCount; i++) {
		it.next();
	}

	yield* it;
}

export const len = <T>(it: II<T>): number => {
	let count = 0;
	for (const _ of it) count++;
	return count;
};

export const findIndexRight = <T>(
	elems: T[],
	pred: (val: T, index: number) => boolean,
): number => {
	for (let i = elems.length - 1; i >= 0; i--) {
		if (pred(elems[i], i)) return i;
	}

	return -1;
};

export const findIndex = <T>(
	elems: II<T>,
	pred: (val: T, index: number) => boolean,
): number => {
	for (const [elem, i] of indexed(elems)) {
		if (pred(elem, i)) return i;
	}

	return -1;
};

export const max = <T>(
	iterable: II<T>,
	gtr = (a: T, b: T) => a > b,
): { value: T; index: number } => {
	const it = iter(iterable);
	let max: T = it.next().value;
	let maxIdx = 0;

	for (const [val, i] of indexed(it)) {
		if (gtr(val, max)) {
			max = val;
			maxIdx = i + 1;
		}
	}

	return { value: max, index: maxIdx };
};

export const min = <T>(
	iterable: II<T>,
	lss = (a: T, b: T) => a < b,
): { value: T; index: number } => {
	const it = iter(iterable);
	let min: T = it.next().value;
	let minIdx = 0;

	for (const [val, i] of indexed(it)) {
		if (lss(val, min)) {
			min = val;
			minIdx = i + 1;
		}
	}

	return { value: min, index: minIdx };
};

export function* range(from: number, to: number, step = 1): It<number> {
	if (to >= from) {
		for (let i = from; i <= to; i += step) {
			yield i;
		}
	} else {
		for (let i = from; i >= to; i -= step) {
			yield i;
		}
	}
}

export function* zip<A, B>(
	as: II<A>,
	bs: II<B>,
): It<[A, B]> {
	const as_ = iter(as);
	const bs_ = iter(bs);
	while (true) {
		const a = as_.next();
		const b = bs_.next();

		if (a.done || b.done) break;

		yield [a.value, b.value];
	}
}

export function* join<T>(iters: II<II<T>>): It<T> {
	for (const iter of iters) {
		yield* iter;
	}
}

export function* filter<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): It<T> {
	for (const a of as) {
		if (pred(a)) {
			yield a;
		}
	}
}

export function* remove<T>(
	vals: II<T>,
	valToRemove: T,
	removeCount = Infinity,
): It<T> {
	let removed = 0;

	for (const val of vals) {
		if (removed < removeCount && val === valToRemove) {
			removed++;
		} else {
			yield val;
		}
	}
}

export function find<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): { value: T | null; index: number } {
	for (const [a, index] of indexed(as)) {
		if (pred(a)) {
			return { value: a, index };
		}
	}

	return { value: null, index: -1 };
}

export function* forever(): II<undefined> {
	while (true) {
		yield;
	}
}

export function count<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): number {
	let count = 0;
	for (const a of as) {
		if (pred(a)) {
			count++;
		}
	}

	return count;
}

export function countWhile<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): number {
	let count = 0;
	for (const a of as) {
		if (pred(a)) {
			count++;
		} else {
			break;
		}
	}

	return count;
}

export function all<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): boolean {
	for (const a of as) {
		if (!pred(a)) {
			return false;
		}
	}

	return true;
}

export const none = <T>(
	as: II<T>,
	pred: (a: T) => boolean,
): boolean => !any(as, pred);

export function any<T>(
	as: II<T>,
	pred: (a: T) => boolean,
): boolean {
	for (const a of as) {
		if (pred(a)) {
			return true;
		}
	}

	return false;
}

export function* chunks<T>(it: II<T>, len: number): It<T[]> {
	if (len <= 0) return;

	let chunk: T[] = [];

	for (const val of it) {
		chunk.push(val);
		if (chunk.length % len === 0) {
			yield chunk;
			chunk = [];
		}
	}

	if (chunk.length > 0) {
		yield chunk;
	}
}

export const fill = <T>(val: T, count: number): T[] => {
	const vals: T[] = [];
	for (let i = 0; i < count; i++) {
		vals.push(val);
	}

	return vals;
};

export const sum = (vals: II<number>): number => {
	let total = 0;

	for (const val of vals) {
		total += val;
	}

	return total;
};

export const prod = (vals: II<number>): number => {
	let p = 1;

	for (const val of vals) {
		p *= val;
	}

	return p;
};

export function* pairs<U, V>(as: II<U>, bs: II<V>): It<[U, V]> {
	const bs_ = [...bs];
	for (const a of as) {
		for (const b of bs_) {
			yield [a, b];
		}
	}
}

export const slice = <T>(xs: T[], start: number, endInclusive: number = xs.length - 1): II<T> => {
	return map(range(start, endInclusive), i => xs[i]);
};

export function* history<T>(it_: II<T>, historyLen = 2): It<T[]> {
	const it = iter(it_);
	const prev = [...take(it, historyLen)];

	yield [...prev];

	for (const val of it) {
		prev.shift();
		yield [...prev, val];
		prev.push(val);
	}
}

export const sorted = <T>(vals: II<T>, cmp: (a: T, b: T) => number): II<T> => {
	return [...vals].sort(cmp);
};

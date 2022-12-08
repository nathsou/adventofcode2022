import { map, range } from "./iterators";

type Dimensions = { rows: number, cols: number };

export class Matrix {
    dims: Dimensions;
    rows: number[][];
    cols: number[][];

    constructor(rows: number[][]) {
        this.dims = {
            rows: rows.length,
            cols: rows[0].length,
        };

        this.rows = rows;
        this.cols = [...map(range(0, this.dims.cols - 1), j => {
            const column: number[] = [];

            for (let i = 0; i < this.dims.rows; i++) {
                column.push(this.rows[i][j]);
            }

            return column;
        })];
    }

    toString(): string {
        return this.rows.map(row => row.join(' ')).join('\n');
    }

    private checkDims(i: number, j: number): void {
        if (i <= 0 || i > this.dims.rows || j <= 0 || j > this.dims.cols) {
            throw new Error(`invalid matrix access: A[${i}, ${j}], dims A: ${this.dims.rows}x${this.dims.cols}`);
        }
    }

    at(i: number, j: number): number {
        this.checkDims(i, j);
        return this.rows[i - 1][j - 1];
    }

    row(i: number): number[] {
        return this.rows[i - 1];
    }

    column(j: number): number[] {
        return this.cols[j - 1];
    }
}
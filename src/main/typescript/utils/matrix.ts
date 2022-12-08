type Dimensions = { rows: number, cols: number };

export class Matrix {
    dims: Dimensions;
    rows: number[][];

    constructor(rows: number[][]) {
        this.rows = rows;
        this.dims = {
            rows: rows.length,
            cols: rows[0].length,
        };
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

    column(j: number): number[] {
        let col: number[] = [];

        for (let i = 1; i <= this.dims.rows; i++) {
            col.push(this.at(i, j));
        }

        return col;
    }

    row(i: number): number[] {
        return this.rows[i];
    }
}
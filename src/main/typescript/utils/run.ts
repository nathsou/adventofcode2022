
export const run = <A, B>(parts: { part1?: () => A, part2?: () => B }) => {
    if (parts.part1) {
        console.log(`part1: ${parts.part1()}`);
    }

    if (parts.part2) {
        console.log(`part2: ${parts.part2()}`);
    }
};

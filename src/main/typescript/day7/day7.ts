import { readFileSync } from 'fs';
import { match, DataType, VariantOf } from 'itsamatch';
import { filter, min, sum } from '../utils/iterators';

type Command = DataType<{
    CD: { name: string },
    LS: {},
    File: { size: number, name: string },
    Dir: { name: string },
}>;

const regexes = {
    cd: new RegExp('\\$ cd (.*)'),
    dir: new RegExp('dir (.*)'),
};

const parseCommand = (line: string): Command => {
    if (line === '$ ls') {
        return { variant: 'LS' };
    }

    if (regexes.cd.test(line)) {
        const match = regexes.cd.exec(line)!;
        return { variant: 'CD', name: match[1] };
    }

    if (regexes.dir.test(line)) {
        const match = regexes.dir.exec(line)!;
        return { variant: 'Dir', name: match[1] };
    }

    const [size, name] = line.split(' ');
    return { variant: 'File', size: Number(size), name };
};

type FileTree = DataType<{
    File: { name: string, size: number },
    Dir: {
        parent: VariantOf<FileTree, 'Dir'> | null,
        path: string[],
        name: string,
        files: FileTree[],
    },
}>;

const interpret = (commands: Command[]): VariantOf<FileTree, 'Dir'> => {
    let currentDir: VariantOf<FileTree, 'Dir'> = {
        variant: 'Dir',
        path: [],
        parent: null,
        name: '',
        files: []
    };

    let path: string[] = [];
    const root: FileTree = currentDir;

    for (const cmd of commands) {
        match(cmd, {
            CD: ({ name }) => {
                if (name == '/') {
                    currentDir = root;
                    path = [];
                } else if (name == '..') {
                    currentDir = currentDir.parent!;
                    path.pop();
                } else {
                    path.push(name);
                    const dest = currentDir.files.find(({ name: dirName }) => name === dirName);

                    if (dest?.variant === 'Dir') {
                        currentDir = dest;
                    } else {
                        throw `directory '${name}' not found`;
                    }
                }
            },
            LS: () => { },
            File: ({ size, name }) => {
                currentDir.files.push({ variant: 'File', name, size });
            },
            Dir: ({ name }) => {
                currentDir.files.push({
                    variant: 'Dir',
                    path: [...path],
                    parent: currentDir,
                    name,
                    files: [],
                });
            },
        });
    }

    return root;
};

const sizeOf = (file: FileTree): number => {
    return match(file, {
        File: ({ size }) => size,
        Dir: ({ files }) => sum(files.map(sizeOf)),
    });
};

const traverse = (root: VariantOf<FileTree, 'Dir'>) => {
    const sizes = new Map<string, number>();

    const aux = (file: FileTree) => {
        if (file.variant === 'Dir') {
            sizes.set(file.path.join('/') + '/' + file.name, sizeOf(file));
            file.files.forEach(aux);
        }
    };

    aux(root);

    return sizes;
};

const parseInput = () => {
    return readFileSync('./input.txt')
        .toString('utf-8')
        .split('\n')
        .filter(line => line.length > 0)
        .map(parseCommand);
};

const part1 = () => {
    const commands = parseInput();
    const root = interpret(commands);
    const sizes = traverse(root);

    return sum(filter(sizes.values(), size => size < 100000));
};

const part2 = (): number => {
    const commands = parseInput();
    const root = interpret(commands);
    const sizes = traverse(root);
    const usedSpace = sizes.get('/')!;
    const unusedSpace = 70000000 - usedSpace;
    const minSpaceRequired = 30000000 - unusedSpace;
    const candidates = filter(sizes.values(), size => size >= minSpaceRequired);

    return min(candidates).value;
};

console.log(part2());

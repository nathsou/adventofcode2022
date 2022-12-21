import { readFileSync } from "fs";
import { DataType, match } from 'itsamatch';
import { dichotomy } from "../utils/functions";
import { run } from "../utils/run";

type BinOp = '+' | '-' | '*' | '/';

type Expr = DataType<{
  Int: { value: number },
  Var: { name: string },
  Bin: { left: Expr, op: BinOp, right: Expr },
}>;

type Value = DataType<{
  Int: { value: number },
  Expr: { expr: Expr },
}>;

const Int = (value: number): Value => ({ variant: 'Int', value });

const evalExpr = (expr: Expr, env: Map<string, Value>): Value => match(expr, {
  Int: ({ value }) => Int(value),
  Var: ({ name }) => {
    return match(env.get(name)!, {
      Int: ({ value }) => Int(value),
      Expr: ({ expr }) => {
        const value = evalExpr(expr, env);
        env.set(name, value);
        return value;
      },
    });
  },
  Bin: ({ left, op, right }): Value => {
    const lhs = evalExpr(left, env);
    const rhs = evalExpr(right, env);

    if (lhs.variant === 'Int' && rhs.variant === 'Int') {
      switch (op) {
        case '+': return { variant: 'Int', value: lhs.value + rhs.value };
        case '-': return { variant: 'Int', value: lhs.value - rhs.value };
        case '*': return { variant: 'Int', value: lhs.value * rhs.value };
        case '/': return { variant: 'Int', value: lhs.value / rhs.value };
      }
    }

    return { variant: 'Expr', expr: { variant: 'Bin', left, op, right } };
  },
});

type Monkey = { name: string, expr: Expr };

const parseExpr = (expr: string): Expr => {
  if (/[\+\-\*\/]/g.test(expr)) {
    const [left, op, right] = expr.split(' ');
    const lhs = parseExpr(left);
    const rhs = parseExpr(right);
    return { variant: 'Bin', left: lhs, op: op as BinOp, right: rhs };
  }

  if (/^\d+$/.test(expr)) {
    return { variant: 'Int', value: Number(expr) };
  }

  return { variant: 'Var', name: expr };
};

const parseInput = (): Monkey[] => {
  return readFileSync('./input.txt')
    .toString("utf-8")
    .split("\n")
    .map(line => {
      const [name, expr] = line.split(':');
      return { name, expr: parseExpr(expr.trim()) };
    });
};

const buildEnv = (monkeys: Monkey[]): Map<string, Value> => {
  const env = new Map<string, Value>();

  for (const { name, expr } of monkeys) {
    env.set(name, { variant: 'Expr', expr });
  }

  return env;
};

const unwrap = (value: Value): number => match(value, {
  Int: ({ value }) => value,
  _: () => { throw 'Not an Int'; },
});

const part1 = () => {
  const monkeys = parseInput();
  const env = buildEnv(monkeys);
  const root = env.get('root')!;
  return match(root, {
    Int: ({ value }) => value,
    Expr: ({ expr }) => unwrap(evalExpr(expr, env)),
  });
};

const part2 = () => {
  const monkeys = parseInput();
  const env = buildEnv(monkeys);
  const root = env.get('root')!;
  const [lhs, rhs] = match(root, {
    Expr: ({ expr }) => match(expr, {
      Bin: ({ left, right }) => [left, right],
      _: () => { throw 'Unexpected root expression'; },
    }),
    _: () => { throw 'Unexpected root expression'; },
  });

  const valueToMatch = unwrap(evalExpr(rhs, env));

  const f = (x: number): number => {
    const newEnv = new Map(env);
    newEnv.set('humn', { variant: 'Int', value: x });
    return unwrap(evalExpr(lhs, newEnv)) - valueToMatch;
  };

  const max = 10 ** 14;
  let [lower, upper] = [-max, max];

  if (f(max) < 0) {
    [lower, upper] = [upper, lower];
  }

  return dichotomy(lower, upper, f);
};

run({ part1, part2 });

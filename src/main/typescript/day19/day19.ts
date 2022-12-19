import { readFileSync } from "fs";
import { map, max } from "../utils/iterators";
import { run } from "../utils/run";

type Blueprint = {
  id: number;
  oreRobotCost: { ore: number };
  clayRobotCost: { ore: number };
  obsidianRobotCost: { ore: number, clay: number };
  geodeRobotCost: { ore: number, obsidian: number };
};

const regex = /Blueprint (?<id>\d+): Each ore robot costs (?<oreRobotCost>\d+) ore. Each clay robot costs (?<clayRobotCost>\d+) ore. Each obsidian robot costs (?<obsidianRobotCost>\d+) ore and (?<obsidianRobotCostClay>\d+) clay. Each geode robot costs (?<geodeRobotCost>\d+) ore and (?<geodeRobotCostObsidian>\d+) obsidian./;

const parseBlueprint = (line: string): Blueprint => {
  const [
    _,
    id,
    oreRobotCost,
    clayRobotCost,
    obsidianRobotCostOre,
    obsidianRobotCostClay,
    geodeRobotCostOre,
    geodeRobotCostObsidian
  ] = line.match(regex)!.values();

  return {
    id: Number(id),
    oreRobotCost: { ore: Number(oreRobotCost) },
    clayRobotCost: { ore: Number(clayRobotCost) },
    obsidianRobotCost: { ore: Number(obsidianRobotCostOre), clay: Number(obsidianRobotCostClay) },
    geodeRobotCost: { ore: Number(geodeRobotCostOre), obsidian: Number(geodeRobotCostObsidian) },
  };
};

const parseInput = (): Blueprint[] => {
  return readFileSync("./input.txt")
    .toString("utf-8")
    .split("\n")
    .map(parseBlueprint);
};

type State = {
  ore: number;
  clay: number;
  obsidian: number;
  geode: number;
  oreRobots: number;
  clayRobots: number;
  obsidianRobots: number;
  geodeRobots: number;
};

type Resource = "ore" | "clay" | "obsidian" | "geode";

const buildRobot = (kind: Resource, state: State, blueprint: Blueprint): State => {
  switch (kind) {
    case "ore":
      return {
        ...state,
        ore: state.ore - blueprint.oreRobotCost.ore,
        oreRobots: state.oreRobots + 1,
      };
    case "clay":
      return {
        ...state,
        ore: state.ore - blueprint.clayRobotCost.ore,
        clayRobots: state.clayRobots + 1,
      };
    case "obsidian":
      return {
        ...state,
        ore: state.ore - blueprint.obsidianRobotCost.ore,
        clay: state.clay - blueprint.obsidianRobotCost.clay,
        obsidianRobots: state.obsidianRobots + 1,
      };
    case "geode":
      return {
        ...state,
        ore: state.ore - blueprint.geodeRobotCost.ore,
        obsidian: state.obsidian - blueprint.geodeRobotCost.obsidian,
        geodeRobots: state.geodeRobots + 1,
      };
  }
};

const collectResources = (state: State): State => {
  return {
    ...state,
    ore: state.ore + state.oreRobots,
    clay: state.clay + state.clayRobots,
    obsidian: state.obsidian + state.obsidianRobots,
    geode: state.geode + state.geodeRobots,
  };
};

type Action = { type: 'build', kind: Resource } | { type: 'doNothing' };

// simple DFS with memoization and 3 pruning heuristics:
// 1. if we have enough resources to build a geode robot, we should do it
// 2. if we have enough robots for a given resource, we should not build more
// 3. (arbitrary) if we have more than 2 geodes more than the best we've seen so far at this step, we should stop
const search = (blueprint: Blueprint, minutes: number) => {
  const maxNeededOres = Math.max(
    blueprint.oreRobotCost.ore,
    blueprint.clayRobotCost.ore,
    blueprint.obsidianRobotCost.ore,
    blueprint.geodeRobotCost.ore,
  );
  const maxNeededClays = blueprint.obsidianRobotCost.clay;
  const maxNeededObsidians = blueprint.geodeRobotCost.obsidian;

  const hash = (t: number, state: State): string => {
    return `${t}:${state.ore}:${state.clay}:${state.obsidian}:${state.oreRobots}:${state.clayRobots}:${state.obsidianRobots}:${state.geodeRobots}`;
  };

  const memo = new Map<string, number>();
  const maxGeodsAt = new Map<number, number>();

  const go = (t: number, state: State): number => {
    if (t === 0) {
      return state.geode;
    }

    const maxAtT = maxGeodsAt.get(t) ?? 0;

    if (maxAtT - state.geode > 2) {
      return 0;
    }

    if (state.geode > maxAtT) {
      maxGeodsAt.set(t, state.geode);
    }

    const key = hash(t, state);

    if (memo.has(key)) {
      return memo.get(key)!;
    }

    const possibleActions: Action[] = [];
    const canBuildOreRobot = state.ore >= blueprint.oreRobotCost.ore;
    const canBuildClayRobot = state.ore >= blueprint.clayRobotCost.ore;
    const canBuildObsidianRobot = state.ore >= blueprint.obsidianRobotCost.ore && state.clay >= blueprint.obsidianRobotCost.clay;

    if (state.ore >= blueprint.geodeRobotCost.ore && state.obsidian >= blueprint.geodeRobotCost.obsidian) {
      possibleActions.push({ type: 'build', kind: 'geode' });
    } else {
      if (canBuildOreRobot && state.oreRobots < maxNeededOres) {
        possibleActions.push({ type: 'build', kind: 'ore' });
      }

      if (canBuildClayRobot && state.clayRobots < maxNeededClays) {
        possibleActions.push({ type: 'build', kind: 'clay' });
      }

      if (canBuildObsidianRobot && state.obsidianRobots < maxNeededObsidians) {
        possibleActions.push({ type: 'build', kind: 'obsidian' });
      }

      possibleActions.push({ type: 'doNothing' });
    }

    const nextState = collectResources(state);

    const nextStates = possibleActions.map(action => {
      switch (action.type) {
        case 'build':
          return buildRobot(action.kind, nextState, blueprint);
        case 'doNothing':
          return nextState;
      }
    });

    const res = max(map(nextStates, nextState => go(t - 1, nextState))).value;

    memo.set(key, res);

    return res;
  };

  return go(minutes, {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0,
    oreRobots: 1,
    clayRobots: 0,
    obsidianRobots: 0,
    geodeRobots: 0
  });
};

const part1 = () => {
  const blueprints = parseInput();
  let sum = 0;

  for (const blueprint of blueprints) {
    const res = search(blueprint, 24);
    console.log(`blueprint ${blueprint.id} -> ${res} geodes`);
    sum += blueprint.id * res;
  }

  return sum;
};

const part2 = () => {
  const blueprints = parseInput();
  let prod = 1;

  for (const blueprint of blueprints) {
    if (blueprint.id > 3) {
      break;
    }
    const res = search(blueprint, 32);
    console.log(`blueprint ${blueprint.id} -> ${res} geodes`);
    prod *= res;
  }

  return prod;
};

run({ part1, part2 });

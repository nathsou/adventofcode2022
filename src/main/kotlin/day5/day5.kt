package day5

import lines

typealias Stack = MutableList<String>
typealias Stacks = MutableList<Stack>
typealias Move = Triple<Int, Int, Int>

fun parseStacks(lines: List<String>): Stacks {
    val numberLine = lines.last()
    val ranges = Regex("([0-9]+)").findAll(numberLine).map { it.range }.toList()
    val stackLines = lines.dropLast(1)
    val stacks = mutableListOf<Stack>()

    for (range in ranges) {
        val stack = mutableListOf<String>()
        for (stackLine in stackLines) {
            if (stackLine.indices.contains(range.endInclusive)) {
                val crate = stackLine.slice(range)
                if (crate.isNotBlank()) {
                    stack.add(crate)
                }
            }
        }

        stacks.add(stack.reversed().toMutableList())
    }

    return stacks
}

val moveRegex = Regex("move ([0-9]+) from ([0-9]+) to ([0-9]+)")
fun parseMove(line: String): Move {
    val result = moveRegex.find(line)
    val (move, from, to) = result!!.destructured
    return Triple(move.toInt(), from.toInt(), to.toInt())
}

data class Input(val moves: List<Move>, val stacks: Stacks)
fun parseInput(): Input {
    val lines = lines("./src/main/kotlin/day5/input.txt")
    val stacks = parseStacks(lines.takeWhile { it.isNotEmpty() })
    val moves = lines.filter { it.startsWith("move") }.map { parseMove(it) }
    return Input(moves, stacks)
}

fun Stacks.moveCratesOneByOne(count: Int, from: Int, to: Int) {
    repeat(count) {
        this[to - 1].add(this[from - 1].removeLast())
    }
}

fun <T> MutableList<T>.removeLast(n: Int): List<T> {
    val items = takeLast(n)
    repeat(n) { removeLast() }
    return items
}

fun Stacks.moveCratesAllAtOnce(count: Int, from: Int, to: Int) {
    this[to - 1].addAll(this[from - 1].removeLast(count))
}

fun Stacks.topCrates(): String {
    return this.joinToString(separator = "") { it.last() }
}

fun part1(): String {
    val input = parseInput()

    for ((count, from, to) in input.moves) {
        input.stacks.moveCratesOneByOne(count, from, to)
    }

    return input.stacks.topCrates()
}

fun part2(): String {
    val input = parseInput()

    for ((count, from, to) in input.moves) {
        input.stacks.moveCratesAllAtOnce(count, from, to)
    }

    return input.stacks.topCrates()
}

package day4

import lines

fun parseInput(): List<Pair<IntRange, IntRange>> {
    fun rangeOf(range: String): IntRange {
        val (start, end) = range.split("-")
        return (start.toInt()..end.toInt())
    }

    return lines("./src/main/kotlin/day4/input.txt").map {
        val (left, right) = it.split(",")
        (rangeOf(left) to rangeOf(right))
    }
}

fun IntRange.fullyContains(other: IntRange): Boolean {
    return start <= other.start && endInclusive >= other.endInclusive
}

fun IntRange.overlaps(other: IntRange): Boolean {
    return start <= other.endInclusive && endInclusive >= other.start
}

fun part1(): Int {
    return parseInput().count { (a, b) -> a.fullyContains(b) || b.fullyContains(a) }
}

fun part2(): Int {
    return parseInput().count { (a, b) -> a.overlaps(b) }
}

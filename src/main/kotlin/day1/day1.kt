package day1

import lines

fun parseInput(): List<List<Int>> {
    val lines = lines("./src/main/kotlin/day1/input.txt")
    var groups = mutableListOf<List<Int>>()
    var startIndex = 0

    fun addGroup(start: Int, end: Int) {
        groups.add(lines.slice((start until end)).map { it.toInt() }.toList())
    }

    for ((index, line) in lines.withIndex()) {
        if (line.isBlank()) {
            addGroup(startIndex, index)
            startIndex = index + 1
        }
    }

    addGroup(startIndex, lines.size)

    return groups
}

fun part1(): Int {
    return parseInput().maxOf { it.sum() }
}

fun part2(): Int {
    return parseInput().map { it.sum() }.sorted().takeLast(3).sum()
}

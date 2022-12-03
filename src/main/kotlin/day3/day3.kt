package day3

import lines

typealias Item = Char
typealias Items = Set<Item>

fun parseInput(): List<Pair<Items, Items>> {
    return lines("./src/main/kotlin/day3/input.txt").map { line ->
        val middle = line.length / 2
        val left = line.substring(0, middle)
        val right = line.substring(middle)
        left.toSet() to right.toSet()
    }
}

fun misplacedItem(left: Items, right: Items): Item {
    for (item in left) {
        if (right.contains(item)) {
            return item
        }
    }

    throw Exception("No misplaced item found")
}

fun Item.priority(): Int {
    return if (this.isLowerCase()) this.code - 96 else this.code - 38
}

fun part1(): Int {
    return parseInput().sumOf { (left, right) -> misplacedItem(left, right).priority() }
}

fun commonItem(rucksacks: List<Items>): Item {
    for (item in rucksacks.first()) {
        if (rucksacks.all { it.contains(item) }) {
            return item
        }
    }

    throw Exception("No common item found")
}

fun part2(): Int {
    return parseInput()
        .map { (left, right) -> left.plus(right) }
        .chunked(3)
        .sumOf { commonItem(it).priority() }
}

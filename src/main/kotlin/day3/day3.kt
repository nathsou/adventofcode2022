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
    return left.first { right.contains(it) }
}

fun Item.priority(): Int {
    return if (isLowerCase()) code - 96 else code - 38
}

fun part1(): Int {
    return parseInput().sumOf { (left, right) -> misplacedItem(left, right).priority() }
}

fun commonItem(rucksacks: List<Items>): Item {
    return rucksacks.first().first { item -> rucksacks.all { it.contains(item) } }
}

fun part2(): Int {
    return parseInput()
        .map { (left, right) -> left.plus(right) }
        .chunked(3)
        .sumOf { commonItem(it).priority() }
}

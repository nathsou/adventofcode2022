package day6

import java.io.File

fun parseInput(): String {
    return File("./src/main/kotlin/day6/input.txt").readText()
}

fun String.startOfPacket(len: Int): Int {
    for (i in (len..this.lastIndex)) {
        val buffer = this.slice((i - (len - 1))..i)
        if (buffer.toSet().count() == len) {
            return i + 1
        }
    }

    return -1
}

fun part1(): Int {
    return parseInput().startOfPacket(4)
}

fun part2(): Int {
    return parseInput().startOfPacket(14)
}

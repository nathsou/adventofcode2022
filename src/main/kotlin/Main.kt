
val solutions = mapOf(
    1 to Pair({ day1.part1() }, { day1.part2() }),
    2 to Pair({ day2.part1() }, { day2.part2() }),
    3 to Pair({ day3.part1() }, { day3.part2() }),
    4 to Pair({ day4.part1() }, { day4.part2() }),
)

fun main() {
    println(solutions.getValue(4).second())
}

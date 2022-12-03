package day2

import lines

enum class Shape { Rock, Paper, Scissors }

fun Shape.score(): Int {
    return when (this) {
        Shape.Rock -> 1
        Shape.Paper -> 2
        Shape.Scissors -> 3
    }
}

val opponentShapeMapping = mapOf(
    "A" to Shape.Rock,
    "B" to Shape.Paper,
    "C" to Shape.Scissors,
)

val myShapeMapping = mapOf(
    "X" to Shape.Rock,
    "Y" to Shape.Paper,
    "Z" to Shape.Scissors,
)

val outcomeMapping = mapOf(
    "X" to Outcome.Loose,
    "Y" to Outcome.Draw,
    "Z" to Outcome.Win,
)

enum class Outcome { Win, Draw, Loose }

fun Outcome.score(): Int {
    return when (this) {
        Outcome.Win -> 6
        Outcome.Draw -> 3
        Outcome.Loose -> 0
    }
}

fun Shape.against(opponent: Shape): Outcome {
    return when (this to opponent) {
        Shape.Rock to Shape.Paper -> Outcome.Loose
        Shape.Rock to Shape.Scissors -> Outcome.Win
        Shape.Paper to Shape.Rock -> Outcome.Win
        Shape.Paper to Shape.Scissors -> Outcome.Loose
        Shape.Scissors to Shape.Rock -> Outcome.Loose
        Shape.Scissors to Shape.Paper -> Outcome.Win
        else -> Outcome.Draw
    }
}

fun Shape.shapeForOutcome(outcome: Outcome): Shape {
    return when(this to outcome) {
        Shape.Rock to Outcome.Win -> Shape.Paper
        Shape.Paper to Outcome.Win -> Shape.Scissors
        Shape.Scissors to Outcome.Win -> Shape.Rock
        Shape.Rock to Outcome.Loose -> Shape.Scissors
        Shape.Paper to Outcome.Loose -> Shape.Rock
        Shape.Scissors to Outcome.Loose -> Shape.Paper
        else -> this
    }
}

fun parseInput(): List<Pair<Shape, String>> {
    return lines("./src/main/kotlin/day2/input.txt").map {
        val (opponent, me) = it.split(" ")
        opponentShapeMapping.getValue(opponent) to me
    }
}

fun part1(): Int {
    val shapes = parseInput()
    return shapes.sumOf { (opponent, me) ->
        val myShape = myShapeMapping.getValue(me)
        myShape.against(opponent).score() + myShape.score()
    }
}

fun part2(): Int {
    val shapes = parseInput()
    return shapes.sumOf { (opponent, me) ->
        val outcome = outcomeMapping.getValue(me)
        val myShape = opponent.shapeForOutcome(outcome)
        outcome.score() + myShape.score()
    }
}

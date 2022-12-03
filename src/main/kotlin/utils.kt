import java.io.File

fun lines(path: String): List<String> {
    return File(path).readLines()
}
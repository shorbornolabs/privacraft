package com.shorbornolabs.privacraft.domain

import com.shorbornolabs.privacraft.data.model.PasswordAnalysis
import java.security.SecureRandom
import kotlin.math.ln
import kotlin.math.log2
import kotlin.math.pow

object PasswordGenerator {

    private val secureRandom = SecureRandom()

    private const val UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    private const val LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
    private const val NUMBERS = "0123456789"
    private const val SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    private val AMBIGUOUS_CHARS = setOf('l', '1', 'I', '0', 'O', 'o')

    // High-entropy Diceware words list
    private val WORD_LIST = listOf(
        "anchor", "apollo", "beacon", "breeze", "canyon", "castle", "cipher", "comet",
        "cosmic", "crater", "crystal", "delta", "dragon", "echo", "eclipse", "falcon",
        "feather", "fathom", "flame", "forest", "galaxy", "glacier", "harbor", "horizon",
        "island", "jaguar", "jupiter", "kinetic", "lagoon", "lantern", "legend", "matrix",
        "meadow", "meteor", "mirage", "nebula", "nectar", "nexus", "oasis", "orbit",
        "panther", "phantom", "phoenix", "pioneer", "planet", "prism", "pulsar", "quantum",
        "quartz", "radiant", "raptor", "realm", "ripple", "safari", "sentry", "shadow",
        "sierra", "silver", "solar", "solitude", "sparrow", "spiral", "summit", "tempest",
        "thunder", "timber", "titan", "torpedo", "tracker", "trident", "tundra", "vanguard",
        "vector", "venture", "vertex", "vortex", "voyage", "whisper", "wildcat", "zenith"
    )

    private val NATO_MAP = mapOf(
        'A' to "Alpha", 'B' to "Bravo", 'C' to "Charlie", 'D' to "Delta", 'E' to "Echo",
        'F' to "Foxtrot", 'G' to "Golf", 'H' to "Hotel", 'I' to "India", 'J' to "Juliett",
        'K' to "Kilo", 'L' to "Lima", 'M' to "Mike", 'N' to "November", 'O' to "Oscar",
        'P' to "Papa", 'Q' to "Quebec", 'R' to "Romeo", 'S' to "Sierra", 'T' to "Tango",
        'U' to "Uniform", 'V' to "Victor", 'W' to "Whiskey", 'X' to "X-ray", 'Y' to "Yankee",
        'Z' to "Zulu", '0' to "Zero", '1' to "One", '2' to "Two", '3' to "Three",
        '4' to "Four", '5' to "Five", '6' to "Six", '7' to "Seven", '8' to "Eight", '9' to "Nine"
    )

    fun generatePassword(
        length: Int = 18,
        includeUpper: Boolean = true,
        includeLower: Boolean = true,
        includeNumbers: Boolean = true,
        includeSymbols: Boolean = true,
        avoidAmbiguous: Boolean = false
    ): String {
        var pool = ""
        val required = mutableListOf<Char>()

        fun filterAmbiguous(s: String): String =
            if (avoidAmbiguous) s.filter { it !in AMBIGUOUS_CHARS } else s

        if (includeUpper) {
            val u = filterAmbiguous(UPPERCASE)
            pool += u
            if (u.isNotEmpty()) required.add(u[secureRandom.nextInt(u.length)])
        }
        if (includeLower) {
            val l = filterAmbiguous(LOWERCASE)
            pool += l
            if (l.isNotEmpty()) required.add(l[secureRandom.nextInt(l.length)])
        }
        if (includeNumbers) {
            val n = filterAmbiguous(NUMBERS)
            pool += n
            if (n.isNotEmpty()) required.add(n[secureRandom.nextInt(n.length)])
        }
        if (includeSymbols) {
            val s = filterAmbiguous(SYMBOLS)
            pool += s
            if (s.isNotEmpty()) required.add(s[secureRandom.nextInt(s.length)])
        }

        if (pool.isEmpty()) pool = filterAmbiguous(LOWERCASE)

        val result = CharArray(length)
        val remainingCount = length - required.size

        for (i in 0 until remainingCount) {
            result[i] = pool[secureRandom.nextInt(pool.length)]
        }
        for (i in 0 until required.size) {
            result[remainingCount + i] = required[i]
        }

        // Shuffle securely
        for (i in result.indices.reversed()) {
            val j = secureRandom.nextInt(i + 1)
            val temp = result[i]
            result[i] = result[j]
            result[j] = temp
        }

        return String(result)
    }

    fun generatePassphrase(
        wordsCount: Int = 4,
        separator: String = "-",
        capitalize: String = "title",
        includeNumber: Boolean = true
    ): String {
        val selectedWords = (1..wordsCount).map {
            val w = WORD_LIST[secureRandom.nextInt(WORD_LIST.size)]
            when (capitalize) {
                "title" -> w.replaceFirstChar { it.uppercase() }
                "upper" -> w.uppercase()
                else -> w.lowercase()
            }
        }.toMutableList()

        if (includeNumber) {
            val num = secureRandom.nextInt(90) + 10
            val idx = secureRandom.nextInt(selectedWords.size)
            selectedWords[idx] = selectedWords[idx] + num
        }

        return selectedWords.joinToString(separator)
    }

    fun generatePin(length: Int = 6): String {
        return (1..length).map {
            NUMBERS[secureRandom.nextInt(NUMBERS.length)]
        }.joinToString("")
    }

    fun analyzeStrength(password: String): PasswordAnalysis {
        val len = password.length
        val hasUpper = password.any { it.isUpperCase() }
        val hasLower = password.any { it.isLowerCase() }
        val hasNumber = password.any { it.isDigit() }
        val hasSymbol = password.any { !it.isLetterOrDigit() }
        val isClean = password.distinct().size >= len * 0.6

        var poolSize = 0
        if (hasUpper) poolSize += 26
        if (hasLower) poolSize += 26
        if (hasNumber) poolSize += 10
        if (hasSymbol) poolSize += 32
        if (poolSize == 0) poolSize = 10

        val entropy = (len * log2(poolSize.toDouble())).toInt()

        val (score, label, colorHex, crackTime) = when {
            entropy < 30 || len < 8 -> Quad(18, "Very Weak", "#EF4444", "Seconds")
            entropy < 50 || len < 12 -> Quad(45, "Moderate", "#F59E0B", "Few Days")
            entropy < 70 -> Quad(75, "Strong", "#38BDF8", "Several Years")
            entropy < 90 -> Quad(92, "Very Strong", "#6366F1", "Millennia")
            else -> Quad(100, "Unbreakable", "#10B981", "Centuries (Unbreakable)")
        }

        return PasswordAnalysis(
            score = score,
            label = label,
            colorHex = colorHex,
            entropy = entropy,
            crackTime = crackTime,
            hasUpper = hasUpper,
            hasLower = hasLower,
            hasNumber = hasNumber,
            hasSymbol = hasSymbol,
            isClean = isClean
        )
    }

    fun fortifyPassword(pwd: String): String {
        var res = pwd
        if (res.length < 16) {
            res += generatePassword(length = 16 - res.length, includeSymbols = true)
        }
        if (!res.any { it.isUpperCase() }) res += UPPERCASE[secureRandom.nextInt(UPPERCASE.length)]
        if (!res.any { it.isDigit() }) res += NUMBERS[secureRandom.nextInt(NUMBERS.length)]
        if (!res.any { !it.isLetterOrDigit() }) res += SYMBOLS[secureRandom.nextInt(SYMBOLS.length)]
        return res
    }

    fun getPhoneticDictation(password: String): String {
        return password.map { ch ->
            val upperCh = ch.uppercaseChar()
            when {
                NATO_MAP.containsKey(upperCh) -> {
                    if (ch.isUpperCase()) "UPPER-${NATO_MAP[upperCh]}" else NATO_MAP[upperCh]!!
                }
                ch == '!' -> "Exclamation"
                ch == '@' -> "At-Sign"
                ch == '#' -> "Hash"
                ch == '$' -> "Dollar"
                ch == '%' -> "Percent"
                ch == '^' -> "Caret"
                ch == '&' -> "Ampersand"
                ch == '*' -> "Asterisk"
                ch == '-' -> "Dash"
                ch == '_' -> "Underscore"
                else -> ch.toString()
            }
        }.joinToString(" • ")
    }

    private data class Quad(val a: Int, val b: String, val c: String, val d: String)
}\n
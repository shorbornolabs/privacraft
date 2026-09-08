package com.shorbornolabs.privacraft.domain

import java.nio.ByteBuffer
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.math.pow

object TotpEngine {

    fun generateTotp(secretKey: String, timeStepSeconds: Int = 30, digits: Int = 6): TotpResult {
        val cleanSecret = secretKey.replace(" ", "").replace("-", "").uppercase()
        if (cleanSecret.isEmpty()) {
            return TotpResult("---", 0, 0f, isError = true)
        }

        return try {
            val keyBytes = decodeBase32(cleanSecret)
            val currentTimeSec = System.currentTimeMillis() / 1000L
            val currentCounter = currentTimeSec / timeStepSeconds
            val remainingSec = (timeStepSeconds - (currentTimeSec % timeStepSeconds)).toInt()
            val progressFraction = remainingSec.toFloat() / timeStepSeconds.toFloat()

            val mac = Mac.getInstance("HmacSHA1")
            mac.init(SecretKeySpec(keyBytes, "HmacSHA1"))

            val buffer = ByteBuffer.allocate(8).putLong(currentCounter).array()
            val hash = mac.doFinal(buffer)

            val offset = (hash[hash.size - 1].toInt() and 0x0F)
            val binary = ((hash[offset].toInt() and 0x7F) shl 24) or
                    ((hash[offset + 1].toInt() and 0xFF) shl 16) or
                    ((hash[offset + 2].toInt() and 0xFF) shl 8) or
                    (hash[offset + 3].toInt() and 0xFF)

            val otp = binary % (10.0.pow(digits.toDouble()).toInt())
            val token = otp.toString().padStart(digits, '0')

            TotpResult(token, remainingSec, progressFraction, isError = false)
        } catch (e: Exception) {
            TotpResult("ERR", 0, 0f, isError = true)
        }
    }

    private fun decodeBase32(base32: String): ByteArray {
        val base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        val clean = base32.trimEnd('=')
        var buffer = 0
        var bitsLeft = 0
        val out = mutableListOf<Byte>()

        for (c in clean) {
            val valIndex = base32Chars.indexOf(c)
            if (valIndex < 0) continue
            buffer = (buffer shl 5) or valIndex
            bitsLeft += 5
            if (bitsLeft >= 8) {
                bitsLeft -= 8
                out.add(((buffer shr bitsLeft) and 0xFF).toByte())
            }
        }
        return out.toByteArray()
    }
}

data class TotpResult(
    val token: String,
    val remainingSeconds: Int,
    val progressFraction: Float,
    val isError: Boolean = false
)

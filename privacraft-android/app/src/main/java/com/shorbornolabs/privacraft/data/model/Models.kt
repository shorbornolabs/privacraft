package com.shorbornolabs.privacraft.data.model

data class TempMailbox(
    val address: String,
    val token: String? = null,
    val domain: String,
    val provider: String, // "guerrilla" | "mailtm"
    val expiresAt: Long = System.currentTimeMillis() + 60 * 60 * 1000L
)

data class MailMessage(
    val id: String,
    val from: String,
    val subject: String,
    val body: String,
    val timestamp: Long = System.currentTimeMillis(),
    val extractedOtp: String? = null,
    val extractedLink: String? = null
)

data class TotpAccount(
    val id: String = java.util.UUID.randomUUID().toString(),
    val issuer: String = "2FA",
    val label: String = "Account",
    val secret: String,
    val digits: Int = 6,
    val period: Int = 30,
    val createdAt: Long = System.currentTimeMillis()
)

data class CopiedPassword(
    val id: String = java.util.UUID.randomUUID().toString(),
    val password: String,
    val mode: String = "password", // "password" | "passphrase" | "pin" | "auditor"
    val timestamp: Long = System.currentTimeMillis()
)

data class PasswordAnalysis(
    val score: Int,
    val label: String,
    val colorHex: String,
    val entropy: Int,
    val crackTime: String,
    val hasUpper: Boolean,
    val hasLower: Boolean,
    val hasNumber: Boolean,
    val hasSymbol: Boolean,
    val isClean: Boolean
)\n
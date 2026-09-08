package com.shorbornolabs.privacraft.domain

object OtpExtractor {
    private val otpRegex = Regex(
        """(?i)(?:verification|confirmation|security|login|sign[ -]?in|one[ -]?time|access|auth)?\s*(?:code|otp|pin|token|password)?\s*[:is\-]?\s*(?:#|\*|)?\b([0-9]{4,8})\b"""
    )

    private val linkRegex = Regex(
        """https?://[^\s"'<>]+(?:verify|confirm|activate|validate|token=)[^\s"'<>]*""",
        RegexOption.IGNORE_CASE
    )

    fun extractOtp(content: String): String? {
        val plainText = content.replace(Regex("<[^>]*>"), " ").replace("&nbsp;", " ")
        val matches = otpRegex.findAll(plainText)
        for (match in matches) {
            val candidate = match.groups[1]?.value ?: continue
            val lower = match.value.lowercase()
            // Require verification context if candidate looks like a generic year (e.g. 2026)
            if (candidate.length == 4 && (candidate.startsWith("19") || candidate.startsWith("20"))) {
                if (!lower.contains("code") && !lower.contains("otp") && !lower.contains("pin")) {
                    continue
                }
            }
            return candidate
        }
        return null
    }

    fun extractVerificationLink(content: String): String? {
        val match = linkRegex.find(content)
        return match?.value
    }
}

package com.shorbornolabs.privacraft.domain

import java.util.regex.Pattern

object OtpExtractor {
    private val otpPattern = Pattern.compile(
        "(?i)(?:verification|confirmation|security|login|sign[ -]?in|one[ -]?time|access|auth)?\s*(?:code|otp|pin|token|password)?\s*[:is\-]?\s*(?:#|\*|)?\b([0-9]{4,8})\b"
    )

    private val linkPattern = Pattern.compile(
        "https?://[^\s"'<>]+(?:verify|confirm|activate|validate|token=)[^\s"'<>]*",
        Pattern.CASE_INSENSITIVE
    )

    fun extractOtp(content: String): String? {
        val plainText = content.replace(Regex("<[^>]*>"), " ").replace("&nbsp;", " ")
        val matcher = otpPattern.matcher(plainText)
        while (matcher.find()) {
            val candidate = matcher.group(1) ?: continue
            val lower = matcher.group().lowercase()
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
        val matcher = linkPattern.matcher(content)
        return if (matcher.find()) matcher.group(0) else null
    }
}\n
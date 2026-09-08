package com.shorbornolabs.privacraft.data.repository

import com.google.gson.JsonParser
import com.shorbornolabs.privacraft.data.model.MailMessage
import com.shorbornolabs.privacraft.data.model.TempMailbox
import com.shorbornolabs.privacraft.domain.OtpExtractor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.security.SecureRandom
import java.util.concurrent.TimeUnit

class TempMailRepository {

    private val secureRandom = SecureRandom()
    private val userChars = "abcdefghijklmnopqrstuvwxyz0123456789"

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .header("User-Agent", "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 PrivaCraft/1.0.0")
                .header("Accept", "application/json, text/plain, */*")
                .build()
            chain.proceed(request)
        }
        .build()

    val availableDomains = listOf(
        "sharklasers.com",
        "guerrillamail.com",
        "guerrillamailblock.com",
        "grr.la",
        "pokemail.net",
        "spam4.me"
    )

    suspend fun createMailbox(domain: String = "sharklasers.com"): Result<TempMailbox> =
        withContext(Dispatchers.IO) {
            try {
                // 1. Initialize GuerrillaMail session to get sid_token
                val initUrl = "https://api.guerrillamail.com/ajax.php?f=get_email_address"
                val initReq = Request.Builder().url(initUrl).get().build()
                val initResp = client.newCall(initReq).execute()
                val initBody = initResp.body?.string() ?: throw Exception("Empty response from mail server")
                val initJson = JsonParser.parseString(initBody).asJsonObject

                val sidToken = initJson.get("sid_token")?.asString
                    ?: throw Exception("Failed to acquire session token")

                // 2. Generate a unique, clean 9-character random username
                val randomUser = (1..9).map {
                    userChars[secureRandom.nextInt(userChars.length)]
                }.joinToString("")

                val targetDomain = if (domain in availableDomains) domain else "sharklasers.com"

                // 3. Set random user and target domain via set_email_user
                try {
                    val setUrl = "https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=$randomUser&lang=en&sid_token=$sidToken&site=$targetDomain"
                    val setReq = Request.Builder().url(setUrl).get().build()
                    val setResp = client.newCall(setReq).execute()
                    setResp.body?.close()
                } catch (_: Exception) {
                    // Non-fatal, fallback to generated address
                }

                val fullAddress = "$randomUser@$targetDomain"

                Result.success(
                    TempMailbox(
                        address = fullAddress,
                        token = sidToken,
                        domain = targetDomain,
                        provider = "guerrilla",
                        expiresAt = System.currentTimeMillis() + 60 * 60 * 1000L
                    )
                )
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun fetchMessages(mailbox: TempMailbox): Result<List<MailMessage>> =
        withContext(Dispatchers.IO) {
            try {
                val token = mailbox.token ?: return@withContext Result.success(emptyList())
                val url = "https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=$token"
                val request = Request.Builder().url(url).get().build()
                val response = client.newCall(request).execute()
                val jsonStr = response.body?.string() ?: return@withContext Result.success(emptyList())
                val json = JsonParser.parseString(jsonStr).asJsonObject

                val listArray = json.getAsJsonArray("list") ?: return@withContext Result.success(emptyList())
                val messages = mutableListOf<MailMessage>()

                for (el in listArray) {
                    if (!el.isJsonObject) continue
                    val obj = el.asJsonObject

                    val from = obj.get("mail_from")?.asString ?: "Unknown"
                    val subject = obj.get("mail_subject")?.asString ?: "No Subject"

                    // Filter out GuerrillaMail's welcome notice so inbox stays pristine
                    if (from.contains("guerrillamail", ignoreCase = true) ||
                        subject.contains("Welcome to Guerrilla", ignoreCase = true)) {
                        continue
                    }

                    val mailId = obj.get("mail_id")?.asString ?: continue
                    val excerpt = obj.get("mail_excerpt")?.asString ?: ""
                    var bodyContent = obj.get("mail_body")?.asString ?: ""

                    // Fetch full body if missing
                    if (bodyContent.isBlank()) {
                        try {
                            val bodyUrl = "https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=$mailId&sid_token=$token"
                            val bodyReq = Request.Builder().url(bodyUrl).get().build()
                            val bodyResp = client.newCall(bodyReq).execute()
                            val bodyJson = JsonParser.parseString(bodyResp.body?.string() ?: "").asJsonObject
                            bodyContent = bodyJson.get("mail_body")?.asString ?: excerpt
                        } catch (_: Exception) {
                            bodyContent = excerpt
                        }
                    }

                    val otp = OtpExtractor.extractOtp("$subject $bodyContent")
                    val link = OtpExtractor.extractVerificationLink(bodyContent)

                    messages.add(
                        MailMessage(
                            id = mailId,
                            from = from,
                            subject = subject,
                            body = bodyContent,
                            extractedOtp = otp,
                            extractedLink = link
                        )
                    )
                }

                Result.success(messages)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun purgeMailbox(mailbox: TempMailbox): Boolean = withContext(Dispatchers.IO) {
        try {
            val token = mailbox.token ?: return@withContext true
            val url = "https://api.guerrillamail.com/ajax.php?f=forget_me&sid_token=$token"
            val request = Request.Builder().url(url).get().build()
            client.newCall(request).execute().body?.close()
            true
        } catch (e: Exception) {
            false
        }
    }
}

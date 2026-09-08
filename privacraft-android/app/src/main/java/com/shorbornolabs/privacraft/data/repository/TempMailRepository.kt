package com.shorbornolabs.privacraft.data.repository

import com.google.gson.JsonParser
import com.shorbornolabs.privacraft.data.model.MailMessage
import com.shorbornolabs.privacraft.data.model.TempMailbox
import com.shorbornolabs.privacraft.domain.OtpExtractor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class TempMailRepository {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    val availableDomains = listOf(
        "sharklasers.com",
        "guerrillamail.com",
        "guerrillamailblock.com",
        "grr.la",
        "pokemail.net",
        "spam4.me",
        "uberip.com"
    )

    suspend fun createGuerrillaMailbox(domain: String = "sharklasers.com"): Result<TempMailbox> =
        withContext(Dispatchers.IO) {
            try {
                // Initialize Guerrilla session
                val url = "https://api.guerrillamail.com/ajax.php?f=get_email_address"
                val request = Request.Builder().url(url).get().build()
                val response = client.newCall(request).execute()
                val jsonStr = response.body?.string() ?: throw Exception("Empty response")
                val json = JsonParser.parseString(jsonStr).asJsonObject

                val sidToken = json.get("sid_token").asString
                val user = json.get("email_user").asString

                // Switch to requested domain
                val setDomainUrl = "https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=$user&domain=$domain&sid_token=$sidToken"
                val setDomainReq = Request.Builder().url(setDomainUrl).get().build()
                val setDomainResp = client.newCall(setDomainReq).execute()
                val setDomainJson = JsonParser.parseString(setDomainResp.body?.string() ?: "").asJsonObject

                val fullAddress = setDomainJson.get("email_addr").asString

                Result.success(
                    TempMailbox(
                        address = fullAddress,
                        token = sidToken,
                        domain = domain,
                        provider = "guerrilla",
                        expiresAt = System.currentTimeMillis() + 60 * 60 * 1000L
                    )
                )
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun fetchGuerrillaMessages(mailbox: TempMailbox): Result<List<MailMessage>> =
        withContext(Dispatchers.IO) {
            try {
                val token = mailbox.token ?: return@withContext Result.success(emptyList())
                val url = "https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=$token"
                val request = Request.Builder().url(url).get().build()
                val response = client.newCall(request).execute()
                val json = JsonParser.parseString(response.body?.string() ?: "").asJsonObject

                val listArray = json.getAsJsonArray("list") ?: return@withContext Result.success(emptyList())
                val messages = mutableListOf<MailMessage>()

                for (el in listArray) {
                    val obj = el.asJsonObject
                    val mailId = obj.get("mail_id").asString
                    val from = obj.get("mail_from")?.asString ?: "Unknown"
                    val subject = obj.get("mail_subject")?.asString ?: "No Subject"
                    val excerpt = obj.get("mail_excerpt")?.asString ?: ""

                    // Fetch full message body
                    val bodyUrl = "https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=$mailId&sid_token=$token"
                    val bodyReq = Request.Builder().url(bodyUrl).get().build()
                    val bodyResp = client.newCall(bodyReq).execute()
                    val bodyJson = JsonParser.parseString(bodyResp.body?.string() ?: "").asJsonObject
                    val bodyContent = bodyJson.get("mail_body")?.asString ?: excerpt

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

    suspend fun purgeGuerrillaMailbox(mailbox: TempMailbox): Boolean = withContext(Dispatchers.IO) {
        try {
            val token = mailbox.token ?: return@withContext true
            val url = "https://api.guerrillamail.com/ajax.php?f=forget_me&sid_token=$token"
            val request = Request.Builder().url(url).get().build()
            client.newCall(request).execute()
            true
        } catch (e: Exception) {
            false
        }
    }
}\n
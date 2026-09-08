package com.shorbornolabs.privacraft.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shorbornolabs.privacraft.data.model.MailMessage
import com.shorbornolabs.privacraft.data.model.TempMailbox
import com.shorbornolabs.privacraft.data.repository.TempMailRepository
import com.shorbornolabs.privacraft.ui.components.CyberCard
import com.shorbornolabs.privacraft.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

@Composable
fun TempMailScreen(
    repository: TempMailRepository,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var mailbox by remember { mutableStateOf<TempMailbox?>(null) }
    var messages by remember { mutableStateOf<List<MailMessage>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var isChecking by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var selectedDomain by remember { mutableStateOf("sharklasers.com") }
    var domainMenuExpanded by remember { mutableStateOf(false) }
    var secondsRemaining by remember { mutableIntStateOf(3600) }
    var selectedMessage by remember { mutableStateOf<MailMessage?>(null) }

    fun copyToClipboard(text: String, label: String = "Copied!") {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("PrivaCraft", text))
        Toast.makeText(context, label, Toast.LENGTH_SHORT).show()
    }

    fun openUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            copyToClipboard(url, "Link copied to clipboard!")
        }
    }

    fun initMailbox(domain: String) {
        scope.launch {
            isLoading = true
            errorMessage = null
            val res = repository.createMailbox(domain)
            res.onSuccess {
                mailbox = it
                selectedDomain = it.domain
                secondsRemaining = 3600
                messages = emptyList()
            }.onFailure { err ->
                errorMessage = err.message ?: "Failed to connect to email server"
                Toast.makeText(context, "Connection Error: $errorMessage", Toast.LENGTH_LONG).show()
            }
            isLoading = false
        }
    }

    fun refreshInbox() {
        val mb = mailbox ?: return
        scope.launch {
            isChecking = true
            val res = repository.fetchMessages(mb)
            res.onSuccess {
                messages = it
            }
            isChecking = false
        }
    }

    fun purgeAndRecreate() {
        val mb = mailbox
        scope.launch {
            isLoading = true
            if (mb != null) {
                repository.purgeMailbox(mb)
            }
            initMailbox(selectedDomain)
        }
    }

    // Auto-initialize once
    LaunchedEffect(Unit) {
        if (mailbox == null) {
            initMailbox(selectedDomain)
        }
    }

    // Polling & Countdown loop
    LaunchedEffect(mailbox) {
        if (mailbox == null) return@LaunchedEffect
        var pollCounter = 0
        while (isActive) {
            delay(1000)
            if (secondsRemaining > 0) secondsRemaining--
            pollCounter++
            if (pollCounter >= 5) { // Check every 5 seconds
                pollCounter = 0
                mailbox?.let { mb ->
                    isChecking = true
                    val res = repository.fetchMessages(mb)
                    res.onSuccess { messages = it }
                    isChecking = false
                }
            }
        }
    }

    val minutes = secondsRemaining / 60
    val secs = secondsRemaining % 60
    val timerStr = "%02d:%02d".format(minutes, secs)

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp, vertical = 6.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 1. Large, Easy-to-Touch Domain Selector Box
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(BgInput)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .clickable { domainMenuExpanded = true }
                    .padding(horizontal = 14.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(AccentCyan.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = null,
                            tint = AccentCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Column {
                        Text(
                            text = "ACTIVE DOMAIN",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDim,
                            letterSpacing = 0.8.sp
                        )
                        Text(
                            text = "@$selectedDomain",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Change",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentCyan
                    )
                    Icon(
                        imageVector = Icons.Default.ArrowDropDown,
                        contentDescription = "Select Domain",
                        tint = AccentCyan,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            DropdownMenu(
                expanded = domainMenuExpanded,
                onDismissRequest = { domainMenuExpanded = false },
                modifier = Modifier.fillMaxWidth(0.9f)
            ) {
                repository.availableDomains.forEach { dom ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = "@$dom",
                                fontSize = 14.sp,
                                fontWeight = if (dom == selectedDomain) FontWeight.Bold else FontWeight.Normal,
                                color = if (dom == selectedDomain) AccentCyan else Color.Unspecified
                            )
                        },
                        onClick = {
                            domainMenuExpanded = false
                            if (dom != selectedDomain) {
                                initMailbox(dom)
                            }
                        }
                    )
                }
            }
        }

        // 2. Clean Lifespan Timer Row (Positioned right below Domain Select)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Timer,
                    contentDescription = "Lifespan",
                    tint = if (secondsRemaining < 300) AccentRose else AccentCyan,
                    modifier = Modifier.size(15.dp)
                )
                Text(
                    text = "Mailbox Lifespan:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextMuted
                )
                Text(
                    text = timerStr,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (secondsRemaining < 300) AccentRose else Color.White
                )
            }

            // Extend +15m Button
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(AccentGreen.copy(alpha = 0.15f))
                    .border(1.dp, AccentGreen.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                    .clickable { secondsRemaining += 15 * 60 }
                    .padding(horizontal = 9.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    tint = AccentGreen,
                    modifier = Modifier.size(13.dp)
                )
                Text(
                    text = "+15m Extend",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentGreen
                )
            }
        }

        // 3. Disposable Mailbox Card with 2 Big Labeled Action Buttons
        CyberCard {
            Text(
                text = "DISPOSABLE MAILBOX",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = TextDim,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Address display or loading/error
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(BgInput)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(10.dp))
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                if (mailbox != null) {
                    Text(
                        text = mailbox!!.address,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentCyan,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                } else if (isLoading) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = AccentCyan,
                            strokeWidth = 2.dp
                        )
                        Text(
                            text = "Creating mailbox...",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextMuted
                        )
                    }
                } else if (errorMessage != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Connection Failed",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AccentRose
                        )
                        Text(
                            text = "Tap to Retry",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentCyan,
                            modifier = Modifier.clickable { initMailbox(selectedDomain) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 2 Big Labeled Buttons: Reload and Delete/Change
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Button 1: Reload
                OutlinedButton(
                    onClick = { refreshInbox() },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan.copy(alpha = 0.6f)),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = AccentCyan.copy(alpha = 0.08f)
                    ),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Reload",
                        tint = AccentCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Reload",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentCyan
                    )
                }

                // Button 2: Delete/Change
                OutlinedButton(
                    onClick = { purgeAndRecreate() },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentRose.copy(alpha = 0.6f)),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = AccentRose.copy(alpha = 0.08f)
                    ),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete / Change",
                        tint = AccentRose,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Delete/Change",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentRose
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Big Full-Width Copy Email Address Button
            Button(
                onClick = {
                    mailbox?.address?.let {
                        copyToClipboard(it, "Email address copied to clipboard!")
                    }
                },
                enabled = mailbox != null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentIndigo,
                    disabledContainerColor = AccentIndigo.copy(alpha = 0.4f)
                )
            ) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Copy Email Address",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        // 4. Live Inbox Section
        CyberCard(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(AccentGreen)
                    )
                    Text(
                        text = "Live Inbox",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                    Text(
                        text = "${messages.size}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentGreen,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(AccentGreen.copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 1.dp)
                    )
                }

                Text(
                    text = if (isChecking) "Checking..." else "Auto-checks every 5s",
                    fontSize = 10.sp,
                    color = TextDim
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (messages.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Email,
                            contentDescription = null,
                            tint = TextDim,
                            modifier = Modifier.size(42.dp)
                        )
                        Text(
                            text = "Inbox is Empty",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                            color = TextMuted
                        )
                        Text(
                            text = "Incoming activation emails and OTPs will appear here automatically.",
                            fontSize = 11.sp,
                            color = TextDim,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(messages) { msg ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(BgInput)
                                .border(1.dp, BorderSubtle, RoundedCornerShape(8.dp))
                                .clickable { selectedMessage = msg }
                                .padding(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = msg.from,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = AccentCyan,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    text = "New",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentGreen,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(AccentGreen.copy(alpha = 0.15f))
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = msg.subject,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            // Highlighted OTP Banner
                            msg.extractedOtp?.let { otp ->
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(AccentGreen.copy(alpha = 0.15f))
                                        .border(1.dp, AccentGreen.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "VERIFICATION CODE",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = AccentGreen
                                        )
                                        Text(
                                            text = otp,
                                            fontFamily = FontFamily.Monospace,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                    Button(
                                        onClick = { copyToClipboard(otp, "OTP Code copied!") },
                                        shape = RoundedCornerShape(6.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = "Copy OTP",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF0F172A)
                                        )
                                    }
                                }
                            }

                            // Highlighted Link Banner
                            msg.extractedLink?.let { link ->
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(AccentCyan.copy(alpha = 0.12f))
                                        .border(1.dp, AccentCyan.copy(alpha = 0.25f), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "ACTIVATION LINK",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = AccentCyan
                                        )
                                        Text(
                                            text = link,
                                            fontSize = 11.sp,
                                            color = Color.White,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Button(
                                            onClick = { openUrl(link) },
                                            shape = RoundedCornerShape(6.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = AccentCyan),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = "Open",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF0F172A)
                                            )
                                        }
                                        OutlinedButton(
                                            onClick = { copyToClipboard(link, "Link copied!") },
                                            shape = RoundedCornerShape(6.dp),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = "Copy",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = AccentCyan
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Email Body Detail Modal Dialog
    selectedMessage?.let { msg ->
        AlertDialog(
            onDismissRequest = { selectedMessage = null },
            title = {
                Column {
                    Text(
                        text = msg.from,
                        fontSize = 12.sp,
                        color = AccentCyan,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = msg.subject,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    msg.extractedOtp?.let { otp ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(6.dp))
                                .background(AccentGreen.copy(alpha = 0.15f))
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "OTP: $otp",
                                fontFamily = FontFamily.Monospace,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Button(
                                onClick = { copyToClipboard(otp, "OTP copied!") },
                                shape = RoundedCornerShape(6.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text("Copy", fontSize = 10.sp, color = Color(0xFF0F172A))
                            }
                        }
                    }

                    val cleanBody = msg.body
                        .replace(Regex("<style[^>]*>.*?</style>", RegexOption.DOT_MATCHES_ALL), "")
                        .replace(Regex("<[^>]*>"), " ")
                        .replace("&nbsp;", " ")
                        .trim()

                    Text(
                        text = if (cleanBody.isNotBlank()) cleanBody else "No message body content.",
                        fontSize = 12.sp,
                        color = Color.White,
                        lineHeight = 18.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { selectedMessage = null }) {
                    Text("Close", color = AccentCyan, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

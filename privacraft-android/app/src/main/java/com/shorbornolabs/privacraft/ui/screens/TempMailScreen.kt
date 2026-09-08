package com.shorbornolabs.privacraft.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
    var selectedDomain by remember { mutableStateOf("sharklasers.com") }
    var domainMenuExpanded by remember { mutableStateOf(false) }
    var secondsRemaining by remember { mutableIntStateOf(3600) }
    var selectedMessage by remember { mutableStateOf<MailMessage?>(null) }

    fun copyToClipboard(text: String, label: String = "Copied!") {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("PrivaCraft", text))
        Toast.makeText(context, label, Toast.LENGTH_SHORT).show()
    }

    fun initMailbox(domain: String) {
        scope.launch {
            isLoading = true
            val res = repository.createGuerrillaMailbox(domain)
            res.onSuccess {
                mailbox = it
                selectedDomain = it.domain
                secondsRemaining = 3600
                messages = emptyList()
            }.onFailure {
                Toast.makeText(context, "Error: ${it.message}", Toast.LENGTH_LONG).show()
            }
            isLoading = false
        }
    }

    fun refreshInbox() {
        val mb = mailbox ?: return
        scope.launch {
            isLoading = true
            val res = repository.fetchGuerrillaMessages(mb)
            res.onSuccess {
                messages = it
            }
            isLoading = false
        }
    }

    // Auto-initialize once
    LaunchedEffect(Unit) {
        if (mailbox == null) {
            initMailbox(selectedDomain)
        }
    }

    // Polling & Timer loop
    LaunchedEffect(mailbox) {
        if (mailbox == null) return@LaunchedEffect
        var pollCounter = 0
        while (isActive) {
            delay(1000)
            if (secondsRemaining > 0) secondsRemaining--
            pollCounter++
            if (pollCounter >= 5) { // Poll every 5s on mobile
                pollCounter = 0
                mailbox?.let { mb ->
                    val res = repository.fetchGuerrillaMessages(mb)
                    res.onSuccess { messages = it }
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
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Domain Picker & Countdown Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Domain Dropdown Pill
            Box {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(BgInput)
                        .border(1.dp, BorderSubtle, RoundedCornerShape(8.dp))
                        .clickable { domainMenuExpanded = true }
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "@$selectedDomain",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentCyan
                    )
                    Icon(
                        imageVector = Icons.Default.ArrowDropDown,
                        contentDescription = "Select Domain",
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                }

                DropdownMenu(
                    expanded = domainMenuExpanded,
                    onDismissRequest = { domainMenuExpanded = false }
                ) {
                    repository.availableDomains.forEach { dom ->
                        DropdownMenuItem(
                            text = { Text("@$dom") },
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

            // Timer Badge with +15m Button
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(BgInput)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Timer,
                    contentDescription = "Lifespan",
                    tint = if (secondsRemaining < 300) AccentRose else AccentCyan,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = timerStr,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (secondsRemaining < 300) AccentRose else Color.White
                )
                Text(
                    text = "+15m",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentGreen,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(AccentGreen.copy(alpha = 0.15f))
                        .clickable { secondsRemaining += 15 * 60 }
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                )
            }
        }

        // Address Display Card
        CyberCard {
            Text(
                text = "DISPOSABLE MAILBOX",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = TextDim,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = mailbox?.address ?: "Creating mailbox...",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.weight(1f)
                )

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = { refreshInbox() }, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Refresh, "Refresh", tint = AccentCyan, modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = {
                            mailbox?.let { mb ->
                                scope.launch { repository.purgeGuerrillaMailbox(mb) }
                            }
                            initMailbox(selectedDomain)
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Delete, "New Mailbox", tint = AccentRose, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = { mailbox?.address?.let { copyToClipboard(it, "Email address copied!") } },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentIndigo)
            ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Copy Email Address", fontWeight = FontWeight.Bold)
            }
        }

        // Live Inbox Section
        CyberCard(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(AccentGreen))
                    Text("Live Inbox", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
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
                    text = if (isLoading) "Checking..." else "Auto-checking",
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
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Email, contentDescription = null, tint = TextDim, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Inbox is Empty", fontWeight = FontWeight.SemiBold, color = TextMuted)
                        Text("Incoming verification emails and OTPs will appear here automatically", fontSize = 11.sp, color = TextDim)
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
                                .padding(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(msg.from, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = AccentCyan)
                                Text("New", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = AccentGreen)
                            }
                            Text(msg.subject, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.White)

                            // OTP Extractor Banner
                            msg.extractedOtp?.let { otp ->
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(AccentGreen.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text("VERIFICATION CODE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = AccentGreen)
                                        Text(otp, fontFamily = FontFamily.Monospace, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }
                                    Button(
                                        onClick = { copyToClipboard(otp, "OTP Code copied!") },
                                        shape = RoundedCornerShape(6.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text("Copy OTP", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Email Body Detail Dialog
    selectedMessage?.let { msg ->
        AlertDialog(
            onDismissRequest = { selectedMessage = null },
            title = { Text(msg.subject) },
            text = {
                Text(
                    text = msg.body.replace(Regex("<[^>]*>"), ""),
                    fontSize = 12.sp,
                    color = Color.White
                )
            },
            confirmButton = {
                TextButton(onClick = { selectedMessage = null }) {
                    Text("Close")
                }
            }
        )
    }
}\n
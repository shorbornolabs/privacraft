package com.shorbornolabs.privacraft.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.shorbornolabs.privacraft.data.model.TotpAccount
import com.shorbornolabs.privacraft.data.repository.StorageRepository
import com.shorbornolabs.privacraft.domain.TotpEngine
import com.shorbornolabs.privacraft.ui.components.AnimatedCircularCountdown
import com.shorbornolabs.privacraft.ui.components.CyberCard
import com.shorbornolabs.privacraft.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun TotpScreen(
    storageRepository: StorageRepository,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val accounts by storageRepository.totpAccounts.collectAsState()

    var secretInput by remember { mutableStateOf("") }
    var selectedAccount by remember { mutableStateOf<TotpAccount?>(null) }
    var saveAccountDialogVisible by remember { mutableStateOf(false) }

    var accountLabel by remember { mutableStateOf("") }
    var accountIssuer by remember { mutableStateOf("") }

    // Active secret to compute TOTP from
    val activeSecret = selectedAccount?.secret ?: secretInput

    var totpToken by remember { mutableStateOf("---") }
    var secondsLeft by remember { mutableIntStateOf(30) }
    var progressFraction by remember { mutableFloatStateOf(1f) }

    fun copyCode(code: String) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("2FA Code", code))
        Toast.makeText(context, "2FA Code copied!", Toast.LENGTH_SHORT).show()
    }

    // 1-second timer loop for live TOTP calculation
    LaunchedEffect(activeSecret) {
        while (isActive) {
            if (activeSecret.isNotBlank()) {
                val res = TotpEngine.generateTotp(activeSecret)
                totpToken = res.token
                secondsLeft = res.remainingSeconds
                progressFraction = res.progressFraction
            } else {
                totpToken = "---"
                secondsLeft = 30
                progressFraction = 1f
            }
            delay(1000)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Saved Accounts Vault Pills
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            item {
                val isLive = selectedAccount == null
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isLive) AccentCyan.copy(alpha = 0.2f) else BgInput)
                        .border(1.dp, if (isLive) AccentCyan else BorderSubtle, RoundedCornerShape(8.dp))
                        .clickable { selectedAccount = null }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("⚡ Live Key", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (isLive) Color.White else TextMuted)
                }
            }

            items(accounts) { acc ->
                val isSelected = selectedAccount?.id == acc.id
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) AccentGreen.copy(alpha = 0.2f) else BgInput)
                        .border(1.dp, if (isSelected) AccentGreen else BorderSubtle, RoundedCornerShape(8.dp))
                        .clickable { selectedAccount = acc; secretInput = acc.secret }
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(acc.issuer.ifBlank { acc.label }, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Delete",
                        tint = TextDim,
                        modifier = Modifier
                            .size(14.dp)
                            .clickable { storageRepository.deleteTotpAccount(acc.id) }
                    )
                }
            }
        }

        // Secret Key Input Card
        CyberCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("SECRET KEY OR OTPAUTH://", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDim, letterSpacing = 1.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Paste",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentCyan,
                        modifier = Modifier.clickable {
                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
                            secretInput = clip
                            selectedAccount = null
                        }
                    )
                    Text(
                        "+ Save",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentGreen,
                        modifier = Modifier.clickable {
                            if (secretInput.isNotBlank()) saveAccountDialogVisible = true
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            OutlinedTextField(
                value = secretInput,
                onValueChange = {
                    secretInput = it
                    selectedAccount = null
                },
                placeholder = { Text("Paste Base32 key (e.g. JBSWY3DPEHPK3PXP)...", fontSize = 12.sp, color = TextDim) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(8.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentCyan,
                    unfocusedBorderColor = BorderSubtle,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )
        }

        // Futuristic Cyber HUD Display Card
        CyberCard(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = selectedAccount?.let { "${it.issuer} • ${it.label}" } ?: "INSTANT 2FA",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentCyan
                )
                Text("RFC 6238", fontSize = 10.sp, color = TextDim)
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Centered Animated Countdown Ring & Code
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    AnimatedCircularCountdown(
                        progressFraction = progressFraction,
                        secondsLeft = secondsLeft,
                        size = 110.dp,
                        strokeWidth = 7.dp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Split 6-digit code
                    val part1 = if (totpToken.length >= 6) totpToken.substring(0, 3) else "---"
                    val part2 = if (totpToken.length >= 6) totpToken.substring(3, 6) else "---"

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = part1,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Box(modifier = Modifier.size(6.dp).clip(RoundedCornerShape(2.dp)).background(TextMuted))
                        Text(
                            text = part2,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }

                    Text("Auto-refreshes every 30 seconds", fontSize = 11.sp, color = TextDim)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = { copyCode(totpToken) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentIndigo)
            ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Copy 2FA Code", fontWeight = FontWeight.Bold)
            }
        }
    }

    // Save Account Dialog
    if (saveAccountDialogVisible) {
        AlertDialog(
            onDismissRequest = { saveAccountDialogVisible = false },
            title = { Text("Save to 2FA Vault") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = accountIssuer,
                        onValueChange = { accountIssuer = it },
                        label = { Text("Issuer / Service (e.g. GitHub, Google)") }
                    )
                    OutlinedTextField(
                        value = accountLabel,
                        onValueChange = { accountLabel = it },
                        label = { Text("Account Label (e.g. user@gmail.com)") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        storageRepository.saveTotpAccount(
                            TotpAccount(
                                issuer = accountIssuer.ifBlank { "2FA" },
                                label = accountLabel.ifBlank { "Account" },
                                secret = secretInput
                            )
                        )
                        saveAccountDialogVisible = false
                        Toast.makeText(context, "Saved to vault!", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { saveAccountDialogVisible = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}\n
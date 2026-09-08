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
import com.shorbornolabs.privacraft.data.repository.StorageRepository
import com.shorbornolabs.privacraft.domain.PasswordGenerator
import com.shorbornolabs.privacraft.ui.components.CyberCard
import com.shorbornolabs.privacraft.ui.theme.*

@Composable
fun PasswordScreen(
    storageRepository: StorageRepository,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val copiedList by storageRepository.copiedPasswords.collectAsState()
    val lastSavedPassword by storageRepository.lastPassword.collectAsState()

    var activeSubmode by remember { mutableStateOf("password") } // password, passphrase, pin, auditor
    var length by remember { mutableFloatStateOf(18f) }
    var includeUpper by remember { mutableStateOf(true) }
    var includeLower by remember { mutableStateOf(true) }
    var includeNumbers by remember { mutableStateOf(true) }
    var includeSymbols by remember { mutableStateOf(true) }
    var avoidAmbiguous by remember { mutableStateOf(false) }
    var isMasked by remember { mutableStateOf(false) }

    var currentPassword by remember {
        mutableStateOf(lastSavedPassword ?: PasswordGenerator.generatePassword(18))
    }

    fun generateNew() {
        val p = when (activeSubmode) {
            "passphrase" -> PasswordGenerator.generatePassphrase(wordsCount = 4)
            "pin" -> PasswordGenerator.generatePin(length.toInt().coerceIn(4, 16))
            else -> PasswordGenerator.generatePassword(
                length = length.toInt(),
                includeUpper = includeUpper,
                includeLower = includeLower,
                includeNumbers = includeNumbers,
                includeSymbols = includeSymbols,
                avoidAmbiguous = avoidAmbiguous
            )
        }
        currentPassword = p
        storageRepository.saveLastPassword(p)
    }

    fun copyPassword(text: String) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("PrivaCraft Password", text))
        storageRepository.saveCopiedPassword(text, activeSubmode)
        Toast.makeText(context, "Password copied!", Toast.LENGTH_SHORT).show()
    }

    val analysis = remember(currentPassword) {
        PasswordGenerator.analyzeStrength(currentPassword)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Output Card
        item {
            CyberCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("ACTIVE PASSWORD", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDim, letterSpacing = 1.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                        IconButton(onClick = { isMasked = !isMasked }, modifier = Modifier.size(28.dp)) {
                            Icon(
                                if (isMasked) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                "Toggle Mask",
                                tint = TextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        IconButton(onClick = { generateNew() }, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Refresh, "Regenerate", tint = AccentCyan, modifier = Modifier.size(18.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = if (isMasked) "•".repeat(currentPassword.length.coerceAtMost(24)) else currentPassword,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Strength bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Strength: ${analysis.label}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = Color(android.graphics.Color.parseColor(analysis.colorHex))
                    )
                    Text(
                        text = "${analysis.entropy} bits",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = { copyPassword(currentPassword) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentIndigo)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Copy Password", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Submode Selector Pills
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(BgInput)
                    .padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                listOf(
                    Pair("password", "Pass"),
                    Pair("passphrase", "Phrase"),
                    Pair("pin", "PIN"),
                    Pair("auditor", "Audit")
                ).forEach { (id, label) ->
                    val isSelected = activeSubmode == id
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) AccentIndigo else Color.Transparent)
                            .clickable {
                                activeSubmode = id
                                generateNew()
                            }
                            .padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = Color.White
                        )
                    }
                }
            }
        }

        // Generation Options
        item {
            CyberCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Length", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.White)
                    Text("${length.toInt()}", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = AccentCyan)
                }

                Slider(
                    value = length,
                    onValueChange = {
                        length = it
                        generateNew()
                    },
                    valueRange = 6f..64f,
                    colors = SliderDefaults.colors(thumbColor = AccentCyan, activeTrackColor = AccentCyan)
                )

                // Presets
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    listOf(12, 16, 18, 24, 32).forEach { p ->
                        OutlinedButton(
                            onClick = {
                                length = p.toFloat()
                                generateNew()
                            },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (length.toInt() == p) AccentCyan.copy(alpha = 0.2f) else Color.Transparent
                            )
                        ) {
                            Text("$p", fontSize = 11.sp, color = Color.White)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Checkboxes
                @Composable
                fun ToggleRow(title: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onCheckedChange(!checked) }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(title, fontSize = 12.sp, color = TextPrimary)
                        Switch(
                            checked = checked,
                            onCheckedChange = onCheckedChange,
                            modifier = Modifier.height(24.dp)
                        )
                    }
                }

                ToggleRow("Uppercase (A-Z)", includeUpper) { includeUpper = it; generateNew() }
                ToggleRow("Lowercase (a-z)", includeLower) { includeLower = it; generateNew() }
                ToggleRow("Numbers (0-9)", includeNumbers) { includeNumbers = it; generateNew() }
                ToggleRow("Symbols (!@#$)", includeSymbols) { includeSymbols = it; generateNew() }
            }
        }

        // Dedicated Copied Passwords Section (Past 10)
        item {
            CyberCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(15.dp))
                        Text("Copied Passwords", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                        Text(
                            text = "${copiedList.size}/10",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(BgInput)
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        )
                    }

                    if (copiedList.isNotEmpty()) {
                        Text(
                            text = "Clear",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentRose,
                            modifier = Modifier.clickable { storageRepository.clearCopiedPasswords() }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                if (copiedList.isEmpty()) {
                    Text(
                        text = "No copied passwords yet. Passwords you copy will appear here (past 10 saved).",
                        fontSize = 11.sp,
                        color = TextDim,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        copiedList.forEach { item ->
                            var masked by remember { mutableStateOf(false) }

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(BgInput)
                                    .padding(horizontal = 8.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = if (masked) "••••••••" else item.password,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = item.mode.uppercase(),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AccentIndigo
                                    )
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    IconButton(onClick = { masked = !masked }, modifier = Modifier.size(26.dp)) {
                                        Icon(if (masked) Icons.Default.Visibility else Icons.Default.VisibilityOff, null, tint = TextMuted, modifier = Modifier.size(14.dp))
                                    }
                                    IconButton(onClick = { copyPassword(item.password) }, modifier = Modifier.size(26.dp)) {
                                        Icon(Icons.Default.ContentCopy, null, tint = AccentCyan, modifier = Modifier.size(14.dp))
                                    }
                                    IconButton(onClick = { storageRepository.deleteCopiedPassword(item.id) }, modifier = Modifier.size(26.dp)) {
                                        Icon(Icons.Default.Delete, null, tint = AccentRose, modifier = Modifier.size(14.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}\n
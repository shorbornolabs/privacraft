package com.shorbornolabs.privacraft.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import kotlin.math.roundToInt

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

    fun buildPassword(len: Int, submode: String): String {
        return when (submode) {
            "passphrase" -> PasswordGenerator.generatePassphrase(wordsCount = 4)
            "pin" -> PasswordGenerator.generatePin(len.coerceIn(4, 16))
            else -> PasswordGenerator.generatePassword(
                length = len,
                includeUpper = includeUpper,
                includeLower = includeLower,
                includeNumbers = includeNumbers,
                includeSymbols = includeSymbols,
                avoidAmbiguous = avoidAmbiguous
            )
        }
    }

    var currentPassword by remember {
        mutableStateOf(lastSavedPassword ?: buildPassword(18, "password"))
    }

    fun generateNew(save: Boolean = true) {
        val p = buildPassword(length.toInt(), activeSubmode)
        currentPassword = p
        if (save) {
            storageRepository.saveLastPassword(p)
        }
    }

    fun copyPassword(text: String) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("PrivaCraft Password", text))
        storageRepository.saveCopiedPassword(text, activeSubmode)
        Toast.makeText(context, "Password copied to clipboard!", Toast.LENGTH_SHORT).show()
    }

    val analysis = remember(currentPassword) {
        PasswordGenerator.analyzeStrength(currentPassword)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Output Card (with stable height to eliminate layout flicker)
        item {
            CyberCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ACTIVE PASSWORD",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDim,
                        letterSpacing = 1.sp
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(
                            onClick = { isMasked = !isMasked },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (isMasked) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle Mask",
                                tint = TextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        IconButton(
                            onClick = { generateNew(save = true) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Regenerate",
                                tint = AccentCyan,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Stable height container: prevents the card and whole screen from jumping when text wraps
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 60.dp),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Text(
                        text = if (isMasked) "•".repeat(currentPassword.length.coerceAtMost(24)) else currentPassword,
                        fontFamily = FontFamily.Monospace,
                        fontSize = when {
                            currentPassword.length > 40 -> 13.sp
                            currentPassword.length > 24 -> 15.sp
                            else -> 17.sp
                        },
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        lineHeight = 22.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

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

                Spacer(modifier = Modifier.height(6.dp))

                LinearProgressIndicator(
                    progress = { analysis.score / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(5.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = Color(android.graphics.Color.parseColor(analysis.colorHex)),
                    trackColor = BorderSubtle
                )

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = { copyPassword(currentPassword) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentIndigo)
                ) {
                    Icon(
                        imageVector = Icons.Default.ContentCopy,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Copy Password", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Submode Selector Pill Dock (Pass, Phrase, PIN, Audit)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF0F172A))
                    .padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                val submodes = listOf(
                    "password" to "Pass",
                    "passphrase" to "Phrase",
                    "pin" to "PIN",
                    "auditor" to "Audit"
                )

                submodes.forEach { (id, label) ->
                    val isSelected = activeSubmode == id
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) AccentIndigo else Color.Transparent)
                            .clickable {
                                activeSubmode = id
                                generateNew(save = true)
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
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Length", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.White)
                    Text(
                        text = "${length.toInt()}",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = AccentCyan,
                        fontSize = 14.sp
                    )
                }

                // Smooth 120 FPS Slider: Only updates password when integer ticks, saves to disk on finish
                Slider(
                    value = length,
                    onValueChange = { newRaw ->
                        val rounded = newRaw.roundToInt()
                        if (rounded != length.toInt()) {
                            length = rounded.toFloat()
                            currentPassword = buildPassword(rounded, activeSubmode)
                        } else {
                            length = newRaw
                        }
                    },
                    onValueChangeFinished = {
                        storageRepository.saveLastPassword(currentPassword)
                    },
                    valueRange = 6f..64f,
                    colors = SliderDefaults.colors(
                        thumbColor = AccentCyan,
                        activeTrackColor = AccentCyan,
                        inactiveTrackColor = BorderSubtle
                    )
                )

                // Presets
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf(12, 16, 18, 24, 32).forEach { p ->
                        OutlinedButton(
                            onClick = {
                                length = p.toFloat()
                                currentPassword = buildPassword(p, activeSubmode)
                                storageRepository.saveLastPassword(currentPassword)
                            },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            shape = RoundedCornerShape(6.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (length.toInt() == p) AccentCyan.copy(alpha = 0.2f) else Color.Transparent
                            )
                        ) {
                            Text(
                                text = "$p",
                                fontSize = 11.sp,
                                color = if (length.toInt() == p) AccentCyan else Color.White,
                                fontWeight = if (length.toInt() == p) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

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

                ToggleRow("Uppercase (A-Z)", includeUpper) {
                    includeUpper = it
                    generateNew(save = true)
                }
                ToggleRow("Lowercase (a-z)", includeLower) {
                    includeLower = it
                    generateNew(save = true)
                }
                ToggleRow("Numbers (0-9)", includeNumbers) {
                    includeNumbers = it
                    generateNew(save = true)
                }
                ToggleRow("Symbols (!@#$)", includeSymbols) {
                    includeSymbols = it
                    generateNew(save = true)
                }
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
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = null,
                            tint = AccentCyan,
                            modifier = Modifier.size(15.dp)
                        )
                        Text(
                            text = "Copied Passwords",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = Color.White
                        )
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
                                    IconButton(
                                        onClick = { masked = !masked },
                                        modifier = Modifier.size(26.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (masked) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = null,
                                            tint = TextMuted,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                    IconButton(
                                        onClick = { copyPassword(item.password) },
                                        modifier = Modifier.size(26.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentCopy,
                                            contentDescription = null,
                                            tint = AccentCyan,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                    IconButton(
                                        onClick = { storageRepository.deleteCopiedPassword(item.id) },
                                        modifier = Modifier.size(26.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = null,
                                            tint = AccentRose,
                                            modifier = Modifier.size(14.dp)
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

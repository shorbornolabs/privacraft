package com.shorbornolabs.privacraft.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.shorbornolabs.privacraft.data.model.CopiedPassword
import com.shorbornolabs.privacraft.data.model.TotpAccount
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class StorageRepository(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("privacraft_storage", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val _copiedPasswords = MutableStateFlow<List<CopiedPassword>>(emptyList())
    val copiedPasswords: StateFlow<List<CopiedPassword>> = _copiedPasswords.asStateFlow()

    private val _totpAccounts = MutableStateFlow<List<TotpAccount>>(emptyList())
    val totpAccounts: StateFlow<List<TotpAccount>> = _totpAccounts.asStateFlow()

    private val _lastPassword = MutableStateFlow<String?>(null)
    val lastPassword: StateFlow<String?> = _lastPassword.asStateFlow()

    init {
        loadCopiedPasswords()
        loadTotpAccounts()
        loadLastPassword()
    }

    // --- Copied Passwords (Past 10 FIFO) ---
    private fun loadCopiedPasswords() {
        val json = prefs.getString("copied_passwords", null) ?: return
        val type = object : TypeToken<List<CopiedPassword>>() {}.type
        val list: List<CopiedPassword> = gson.fromJson(json, type) ?: emptyList()
        _copiedPasswords.value = list
    }

    fun saveCopiedPassword(password: String, mode: String = "password") {
        if (password.isBlank()) return
        val current = _copiedPasswords.value.toMutableList()

        // Filter duplicate if already exists
        val filtered = current.filter { it.password != password }

        val newItem = CopiedPassword(
            password = password,
            mode = mode,
            timestamp = System.currentTimeMillis()
        )

        // Add to top, keep max 10
        val updated = listOf(newItem) + filtered.take(9)
        _copiedPasswords.value = updated
        prefs.edit().putString("copied_passwords", gson.toJson(updated)).apply()
    }

    fun deleteCopiedPassword(id: String) {
        val updated = _copiedPasswords.value.filter { it.id != id }
        _copiedPasswords.value = updated
        prefs.edit().putString("copied_passwords", gson.toJson(updated)).apply()
    }

    fun clearCopiedPasswords() {
        _copiedPasswords.value = emptyList()
        prefs.edit().remove("copied_passwords").apply()
    }

    // --- 2FA Accounts Vault ---
    private fun loadTotpAccounts() {
        val json = prefs.getString("totp_accounts", null) ?: return
        val type = object : TypeToken<List<TotpAccount>>() {}.type
        val list: List<TotpAccount> = gson.fromJson(json, type) ?: emptyList()
        _totpAccounts.value = list
    }

    fun saveTotpAccount(account: TotpAccount) {
        val current = _totpAccounts.value.toMutableList()
        val existingIndex = current.indexOfFirst { it.id == account.id || it.secret == account.secret }
        if (existingIndex >= 0) {
            current[existingIndex] = account
        } else {
            current.add(account)
        }
        _totpAccounts.value = current
        prefs.edit().putString("totp_accounts", gson.toJson(current)).apply()
    }

    fun deleteTotpAccount(id: String) {
        val updated = _totpAccounts.value.filter { it.id != id }
        _totpAccounts.value = updated
        prefs.edit().putString("totp_accounts", gson.toJson(updated)).apply()
    }

    // --- Active Password Session Persistence ---
    private fun loadLastPassword() {
        _lastPassword.value = prefs.getString("last_active_password", null)
    }

    fun saveLastPassword(password: String) {
        _lastPassword.value = password
        prefs.edit().putString("last_active_password", password).apply()
    }
}

package com.shorbornolabs.privacraft

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.shorbornolabs.privacraft.data.repository.StorageRepository
import com.shorbornolabs.privacraft.data.repository.TempMailRepository
import com.shorbornolabs.privacraft.ui.components.CyberNavDock
import com.shorbornolabs.privacraft.ui.screens.PasswordScreen
import com.shorbornolabs.privacraft.ui.screens.TempMailScreen
import com.shorbornolabs.privacraft.ui.screens.TotpScreen
import com.shorbornolabs.privacraft.ui.theme.BgDark
import com.shorbornolabs.privacraft.ui.theme.PrivaCraftTheme

class MainActivity : ComponentActivity() {

    private val tempMailRepository by lazy { TempMailRepository() }
    private val storageRepository by lazy { StorageRepository(applicationContext) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PrivaCraftTheme {
                var currentTab by remember { mutableStateOf("tempmail") } // tempmail, password, totp

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        CyberNavDock(
                            currentTab = currentTab,
                            onTabSelected = { currentTab = it },
                            modifier = Modifier
                                .padding(horizontal = 14.dp, vertical = 12.dp)
                                .navigationBarsPadding()
                        )
                    }
                ) { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(BgDark)
                            .padding(innerPadding)
                            .statusBarsPadding(),
                        color = BgDark
                    ) {
                        when (currentTab) {
                            "tempmail" -> TempMailScreen(repository = tempMailRepository)
                            "password" -> PasswordScreen(storageRepository = storageRepository)
                            "totp" -> TotpScreen(storageRepository = storageRepository)
                        }
                    }
                }
            }
        }
    }
}\n
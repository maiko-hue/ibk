package pe.ibk.apkpro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import pe.ibk.apkpro.ui.screens.HomeScreen
import pe.ibk.apkpro.ui.theme.IbkTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            IbkTheme {
                HomeScreen()
            }
        }
    }
}

package pe.ibk.apkpro.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import pe.ibk.apkpro.R
import pe.ibk.apkpro.ui.theme.IbkGreen
import pe.ibk.apkpro.ui.theme.IbkGreenDark

@Composable
fun TopHeader(
    onMenuClick: () -> Unit = {},
    onNotificationsClick: () -> Unit = {}
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(IbkGreen)
            .padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 28.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Menu Button (Circular with darker green background)
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(IbkGreenDark),
            contentAlignment = Alignment.Center
        ) {
            IconButton(
                onClick = onMenuClick,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_menu),
                    contentDescription = "Menú",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Interbank Logo
        Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "Interbank",
            modifier = Modifier
                .height(32.dp)
                .fillMaxWidth(0.55f),
            contentScale = ContentScale.Fit
        )

        // Notification Bell
        IconButton(
            onClick = onNotificationsClick,
            modifier = Modifier.size(38.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_notifications),
                contentDescription = "Notificaciones",
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

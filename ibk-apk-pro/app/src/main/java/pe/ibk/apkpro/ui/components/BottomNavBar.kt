package pe.ibk.apkpro.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.ibk.apkpro.R
import pe.ibk.apkpro.ui.theme.IbkGreen
import pe.ibk.apkpro.ui.theme.IbkQrBlue

enum class BottomNavItem {
    INICIO,
    MOVIMIENTOS,
    QR,
    BENEFICIOS,
    PARA_TI
}

@Composable
fun BottomNavBar(
    selectedItem: BottomNavItem = BottomNavItem.INICIO,
    onItemSelected: (BottomNavItem) -> Unit = {}
) {
    Box(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Bottom Bar Background
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(elevation = 12.dp)
                .background(Color.White)
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1. Inicio
            NavItemButton(
                title = "Inicio",
                icon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_home),
                        contentDescription = "Inicio",
                        tint = if (selectedItem == BottomNavItem.INICIO) IbkGreen else Color(0xFF434446),
                        modifier = Modifier.size(24.dp)
                    )
                },
                isActive = selectedItem == BottomNavItem.INICIO,
                onClick = { onItemSelected(BottomNavItem.INICIO) }
            )

            // 2. Movimientos
            NavItemButton(
                title = "Movimientos",
                icon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_movements),
                        contentDescription = "Movimientos",
                        tint = if (selectedItem == BottomNavItem.MOVIMIENTOS) IbkGreen else Color(0xFF434446),
                        modifier = Modifier.size(24.dp)
                    )
                },
                isActive = selectedItem == BottomNavItem.MOVIMIENTOS,
                onClick = { onItemSelected(BottomNavItem.MOVIMIENTOS) }
            )

            // Spacer for Central QR FAB
            Box(modifier = Modifier.size(56.dp))

            // 3. Beneficios
            NavItemButton(
                title = "Beneficios",
                icon = {
                    Image(
                        painter = painterResource(id = R.drawable.beneficios),
                        contentDescription = "Beneficios",
                        modifier = Modifier.size(24.dp),
                        contentScale = ContentScale.Fit
                    )
                },
                isActive = selectedItem == BottomNavItem.BENEFICIOS,
                onClick = { onItemSelected(BottomNavItem.BENEFICIOS) }
            )

            // 4. Para ti
            NavItemButton(
                title = "Para ti",
                icon = {
                    Image(
                        painter = painterResource(id = R.drawable.para_ti),
                        contentDescription = "Para ti",
                        modifier = Modifier.size(24.dp),
                        contentScale = ContentScale.Fit
                    )
                },
                isActive = selectedItem == BottomNavItem.PARA_TI,
                onClick = { onItemSelected(BottomNavItem.PARA_TI) }
            )
        }

        // Central QR FAB floating above bar
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-20).dp)
                .size(60.dp)
                .shadow(elevation = 8.dp, shape = CircleShape)
                .clip(CircleShape)
                .background(IbkQrBlue)
                .border(4.dp, Color.White, CircleShape)
                .clickable { onItemSelected(BottomNavItem.QR) },
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.qr),
                contentDescription = "QR",
                modifier = Modifier.size(28.dp),
                contentScale = ContentScale.Fit
            )
        }
    }
}

@Composable
private fun NavItemButton(
    title: String,
    icon: @Composable () -> Unit,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        icon()
        Text(
            text = title,
            fontSize = 9.5.sp,
            fontWeight = FontWeight.Bold,
            color = if (isActive) IbkGreen else Color(0xFF434446),
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

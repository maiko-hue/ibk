package pe.ibk.apkpro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.ibk.apkpro.ui.theme.IbkDarkBlue
import pe.ibk.apkpro.ui.theme.IbkDivider
import pe.ibk.apkpro.ui.theme.IbkTextMuted

enum class HomeTab {
    OPERACIONES,
    PRODUCTOS
}

@Composable
fun TabBar(
    selectedTab: HomeTab,
    onTabSelected: (HomeTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .offset(y = (-16).dp)
            .shadow(elevation = 3.dp, shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .background(Color.White)
            .padding(top = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth()
        ) {
            TabButton(
                title = "Mis operaciones",
                isSelected = selectedTab == HomeTab.OPERACIONES,
                onClick = { onTabSelected(HomeTab.OPERACIONES) },
                modifier = Modifier.weight(1f)
            )
            TabButton(
                title = "Mis productos",
                isSelected = selectedTab == HomeTab.PRODUCTOS,
                onClick = { onTabSelected(HomeTab.PRODUCTOS) },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun TabButton(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) IbkDarkBlue else IbkTextMuted,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(3.dp)
                .background(if (isSelected) IbkDarkBlue else IbkDivider)
        )
    }
}

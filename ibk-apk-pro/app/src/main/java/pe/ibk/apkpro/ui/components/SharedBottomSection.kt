package pe.ibk.apkpro.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.ibk.apkpro.R
import pe.ibk.apkpro.ui.theme.IbkGreen

@Composable
fun SharedBottomSection(
    onWhatsappClick: () -> Unit = {},
    onMillasClick: () -> Unit = {},
    onFinanzasClick: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 20.dp)
    ) {
        // Pills container (WhatsApp and Millas Benefit)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            PillButton(
                iconRes = R.drawable.whatsapp,
                text = "¡Plinea por Whatsapp aquí!",
                onClick = onWhatsappClick,
                modifier = Modifier.weight(1.1f)
            )
            PillButton(
                iconRes = R.drawable.millas,
                text = "Millas Benefit",
                onClick = onMillasClick,
                modifier = Modifier.weight(0.9f)
            )
        }

        Spacer(modifier = Modifier.height(26.dp))

        // Finanzas Header
        Text(
            text = "Mis finanzas",
            fontSize = 17.sp,
            fontWeight = FontWeight.ExtraBold,
            color = IbkGreen,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Banner
        Image(
            painter = painterResource(id = R.drawable.banner_finanzas),
            contentDescription = "Mis Finanzas",
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .clickable(onClick = onFinanzasClick),
            contentScale = ContentScale.FillWidth
        )

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun PillButton(
    iconRes: Int,
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(30.dp))
            .background(Color(0xFFEBF8F2))
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 11.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Image(
            painter = painterResource(id = iconRes),
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            contentScale = ContentScale.Fit
        )
        Text(
            text = text,
            color = IbkGreen,
            fontSize = 11.5.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 6.dp),
            maxLines = 1
        )
    }
}

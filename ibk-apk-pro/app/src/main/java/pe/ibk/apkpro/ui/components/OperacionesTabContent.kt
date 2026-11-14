package pe.ibk.apkpro.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.ibk.apkpro.R
import pe.ibk.apkpro.ui.theme.IbkDarkBlue
import pe.ibk.apkpro.ui.theme.IbkDarkGreenBorder
import pe.ibk.apkpro.ui.theme.IbkGreenBadge
import pe.ibk.apkpro.ui.theme.IbkTextDark
import pe.ibk.apkpro.ui.theme.IbkTextLight

data class OperationItemData(
    val title: String,
    val iconRes: Int? = null,
    val isCustomIcon: Boolean = false,
    val badge: String? = null,
    val onClick: () -> Unit = {}
)

@Composable
fun OperacionesTabContent(
    isLoading: Boolean,
    onOperationClick: (String) -> Unit = {}
) {
    val operations = listOf(
        OperationItemData("Plinear", R.drawable.plin, onClick = { onOperationClick("plin") }),
        OperationItemData("Transferir\ndinero", R.drawable.transferencias, onClick = { onOperationClick("transferir") }),
        OperationItemData("Pagar\nservicios", R.drawable.servicios, onClick = { onOperationClick("servicios") }),
        OperationItemData("Ver datos\nde tarjeta", R.drawable.ver_datos, badge = "Nuevo", onClick = { onOperationClick("tarjeta_datos") }),
        OperationItemData("Recargar\ncelular", R.drawable.recargas, onClick = { onOperationClick("recargar_cel") }),
        OperationItemData("Recargar\ntransporte", R.drawable.retiros, onClick = { onOperationClick("transporte") }),
        OperationItemData("Agregar\nproducto", isCustomIcon = true, onClick = { onOperationClick("agregar_prod") }),
        OperationItemData("Ver más\nopciones", R.drawable.ver_mas, onClick = { onOperationClick("ver_mas") })
    )

    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Exchange Rate Text
        Text(
            text = "T.C. referencial: Compra: 3.323 | Venta: 3.474",
            color = IbkTextLight,
            fontSize = 11.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp, bottom = 12.dp)
        )

        // 4 Columns Grid
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Row 1 (first 4 items)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                operations.subList(0, 4).forEach { item ->
                    OperationGridItem(
                        item = item,
                        isLoading = isLoading,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Row 2 (next 4 items)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                operations.subList(4, 8).forEach { item ->
                    OperationGridItem(
                        item = item,
                        isLoading = isLoading,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Shared Pills and Banner
        SharedBottomSection()
    }
}

@Composable
private fun OperationGridItem(
    item: OperationItemData,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clickable(enabled = !isLoading, onClick = item.onClick)
            .padding(horizontal = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Icon Box
        Box(
            modifier = Modifier
                .size(56.dp)
                .shadow(elevation = 2.dp, shape = RoundedCornerShape(16.dp))
                .clip(RoundedCornerShape(16.dp))
                .background(if (item.isCustomIcon) IbkGreenBadge else Color.White)
                .then(
                    if (item.isCustomIcon) Modifier.border(1.dp, IbkDarkGreenBorder, RoundedCornerShape(16.dp))
                    else Modifier.border(1.5.dp, Color(0xFFF0F0F0), RoundedCornerShape(16.dp))
                )
                .shimmerEffect(enabled = isLoading),
            contentAlignment = Alignment.Center
        ) {
            if (!isLoading) {
                if (item.isCustomIcon) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_card_plus),
                        contentDescription = null,
                        tint = Color.Unspecified,
                        modifier = Modifier.size(26.dp)
                    )
                } else if (item.iconRes != null) {
                    Image(
                        painter = painterResource(id = item.iconRes),
                        contentDescription = item.title,
                        modifier = Modifier.size(30.dp),
                        contentScale = ContentScale.Fit
                    )
                }

                // Badge (Nuevo)
                if (item.badge != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .offset(x = 6.dp, y = (-6).dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(IbkDarkBlue)
                            .border(1.5.dp, Color.White, RoundedCornerShape(10.dp))
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = item.badge,
                            color = Color.White,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Label
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(10.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect(true)
            )
        } else {
            Text(
                text = item.title,
                fontSize = 10.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = IbkTextDark,
                textAlign = TextAlign.Center,
                lineHeight = 13.sp,
                maxLines = 2
            )
        }
    }
}

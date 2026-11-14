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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.ibk.apkpro.R
import pe.ibk.apkpro.data.Account
import pe.ibk.apkpro.ui.theme.IbkBorder
import pe.ibk.apkpro.ui.theme.IbkGreen
import pe.ibk.apkpro.ui.theme.IbkTextDark
import pe.ibk.apkpro.ui.theme.IbkTextMuted

@Composable
fun ProductosTabContent(
    accounts: List<Account>,
    isBalanceHidden: Boolean,
    isLoading: Boolean,
    onToggleBalanceVisibility: () -> Unit,
    onEditClick: () -> Unit = {},
    onAccountClick: (Account) -> Unit = {},
    onAddProductClick: () -> Unit = {}
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Top Card Header Bar ("Ver datos de tarjeta" + edit & eye icons)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ver_datos_2),
                    contentDescription = null,
                    modifier = Modifier.size(22.dp)
                )
                Text(
                    text = "Ver datos de tarjeta",
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = IbkTextDark
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Edit Pencil Button
                IconButton(
                    onClick = onEditClick,
                    modifier = Modifier.size(30.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_pencil),
                        contentDescription = "Editar",
                        tint = Color.Unspecified,
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Eye Toggle Button
                IconButton(
                    onClick = onToggleBalanceVisibility,
                    modifier = Modifier.size(30.dp)
                ) {
                    Icon(
                        painter = painterResource(
                            id = if (isBalanceHidden) R.drawable.ic_eye_closed else R.drawable.ic_eye_open
                        ),
                        contentDescription = if (isBalanceHidden) "Mostrar saldo" else "Ocultar saldo",
                        tint = Color.Unspecified,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }

        HorizontalDivider(thickness = 2.dp, color = IbkBorder)

        // Accounts List
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        ) {
            accounts.forEach { account ->
                AccountItemRow(
                    account = account,
                    isBalanceHidden = isBalanceHidden,
                    isLoading = isLoading,
                    onClick = { onAccountClick(account) }
                )
                HorizontalDivider(thickness = 1.dp, color = IbkBorder)
            }

            // Inversiones Item
            InversionesItemRow(
                isLoading = isLoading,
                onClick = { /* Navigate to inversiones */ }
            )
            HorizontalDivider(thickness = 1.dp, color = IbkBorder)
        }

        Spacer(modifier = Modifier.height(14.dp))

        // "Agregar nuevo producto" Dashed Box
        AddProductDashedButton(onClick = onAddProductClick)

        Spacer(modifier = Modifier.height(10.dp))

        // Shared Bottom Section
        SharedBottomSection()
    }
}

@Composable
private fun AccountItemRow(
    account: Account,
    isBalanceHidden: Boolean,
    isLoading: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Icon
        Image(
            painter = painterResource(id = R.drawable.cuenta_ahorro),
            contentDescription = account.name,
            modifier = Modifier.size(40.dp)
        )

        Spacer(modifier = Modifier.width(14.dp))

        // Info
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = account.name,
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Bold,
                color = IbkTextDark
            )
            Spacer(modifier = Modifier.height(2.dp))

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .width(110.dp)
                        .height(14.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect(true)
                )
            } else {
                Text(
                    text = if (isBalanceHidden) account.getHiddenBalance() else account.getFormattedBalance(),
                    fontSize = 14.5.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = IbkTextDark
                )
            }

            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = account.subtitle,
                fontSize = 11.sp,
                color = IbkTextMuted
            )
        }

        // Chevron Arrow
        Icon(
            painter = painterResource(id = R.drawable.ic_chevron_right),
            contentDescription = null,
            tint = Color(0xFFCCCCCC),
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
private fun InversionesItemRow(
    isLoading: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = R.drawable.cuenta_inversion),
            contentDescription = "Mis Inversiones",
            modifier = Modifier.size(40.dp)
        )

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "Mis Inversiones",
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Bold,
                color = IbkTextDark
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Explorar productos",
                fontSize = 11.sp,
                color = IbkTextMuted
            )
        }

        Icon(
            painter = painterResource(id = R.drawable.ic_chevron_right),
            contentDescription = null,
            tint = Color(0xFFCCCCCC),
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
private fun AddProductDashedButton(
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFF8FCF9))
            .border(
                width = 1.5.dp,
                color = IbkGreen,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(IbkGreen),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "+",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Column {
                Text(
                    text = "Agregar nuevo producto",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = IbkTextDark
                )
                Text(
                    text = "Obtén una cuenta, tarjeta y más.",
                    fontSize = 11.sp,
                    color = IbkTextMuted
                )
            }
        }
    }
}

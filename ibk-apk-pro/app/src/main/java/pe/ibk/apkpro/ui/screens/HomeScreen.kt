package pe.ibk.apkpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import pe.ibk.apkpro.data.Account
import pe.ibk.apkpro.ui.components.BottomNavBar
import pe.ibk.apkpro.ui.components.BottomNavItem
import pe.ibk.apkpro.ui.components.HomeTab
import pe.ibk.apkpro.ui.components.OperacionesTabContent
import pe.ibk.apkpro.ui.components.ProductosTabContent
import pe.ibk.apkpro.ui.components.TabBar
import pe.ibk.apkpro.ui.components.TopHeader
import pe.ibk.apkpro.ui.theme.IbkTheme
import pe.ibk.apkpro.ui.viewmodel.HomeUiState
import pe.ibk.apkpro.ui.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel(),
    onNavigateToConfig: () -> Unit = {},
    onNavigateToNoti: () -> Unit = {},
    onNavigateToOperation: (String) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    HomeScreenContent(
        uiState = uiState,
        onSelectTab = { viewModel.selectTab(it) },
        onSelectBottomNav = { viewModel.selectBottomNav(it) },
        onToggleBalanceVisibility = { viewModel.toggleBalanceVisibility() },
        onNavigateToConfig = onNavigateToConfig,
        onNavigateToNoti = onNavigateToNoti,
        onNavigateToOperation = onNavigateToOperation
    )
}

@Composable
fun HomeScreenContent(
    uiState: HomeUiState,
    onSelectTab: (HomeTab) -> Unit = {},
    onSelectBottomNav: (BottomNavItem) -> Unit = {},
    onToggleBalanceVisibility: () -> Unit = {},
    onNavigateToConfig: () -> Unit = {},
    onNavigateToNoti: () -> Unit = {},
    onNavigateToOperation: (String) -> Unit = {}
) {
    val scrollState = rememberScrollState()

    Scaffold(
        bottomBar = {
            BottomNavBar(
                selectedItem = uiState.selectedBottomNav,
                onItemSelected = onSelectBottomNav
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = innerPadding.calculateBottomPadding())
                .background(Color.White)
        ) {
            // 1. Header (Green with burger menu, logo and bell)
            TopHeader(
                onMenuClick = onNavigateToConfig,
                onNotificationsClick = onNavigateToNoti
            )

            // 2. Tabs ("Mis operaciones" and "Mis productos")
            TabBar(
                selectedTab = uiState.selectedTab,
                onTabSelected = onSelectTab
            )

            // 3. Scrollable Tab Content
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(scrollState)
            ) {
                when (uiState.selectedTab) {
                    HomeTab.OPERACIONES -> {
                        OperacionesTabContent(
                            isLoading = uiState.isLoading,
                            onOperationClick = onNavigateToOperation
                        )
                    }
                    HomeTab.PRODUCTOS -> {
                        ProductosTabContent(
                            accounts = uiState.accounts,
                            isBalanceHidden = uiState.isBalanceHidden,
                            isLoading = uiState.isLoading,
                            onToggleBalanceVisibility = onToggleBalanceVisibility,
                            onEditClick = { /* Handle edit account info */ },
                            onAccountClick = { account -> /* Handle detail */ },
                            onAddProductClick = { /* Handle add product */ }
                        )
                    }
                }
            }
        }
    }
}

@Preview(name = "Mis Operaciones", showBackground = true, showSystemUi = true)
@Composable
fun HomeScreenPreviewOperaciones() {
    IbkTheme {
        HomeScreenContent(
            uiState = HomeUiState(
                isLoading = false,
                selectedTab = HomeTab.OPERACIONES,
                isBalanceHidden = false,
                accounts = listOf(
                    Account("1", "Cuenta Simple Soles", "S/", 1000.0),
                    Account("2", "Cuenta Simple Dólares", "$", 1000.0)
                )
            )
        )
    }
}

@Preview(name = "Mis Productos", showBackground = true, showSystemUi = true)
@Composable
fun HomeScreenPreviewProductos() {
    IbkTheme {
        HomeScreenContent(
            uiState = HomeUiState(
                isLoading = false,
                selectedTab = HomeTab.PRODUCTOS,
                isBalanceHidden = true,
                accounts = listOf(
                    Account("1", "Cuenta Simple Soles", "S/", 1000.0),
                    Account("2", "Cuenta Simple Dólares", "$", 1000.0)
                )
            )
        )
    }
}

package pe.ibk.apkpro.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.ibk.apkpro.data.Account
import pe.ibk.apkpro.data.AccountPreferences
import pe.ibk.apkpro.ui.components.BottomNavItem
import pe.ibk.apkpro.ui.components.HomeTab

data class HomeUiState(
    val isLoading: Boolean = true,
    val selectedTab: HomeTab = HomeTab.OPERACIONES,
    val selectedBottomNav: BottomNavItem = BottomNavItem.INICIO,
    val isBalanceHidden: Boolean = true,
    val accounts: List<Account> = emptyList()
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val preferences = AccountPreferences(application)

    private val _uiState = MutableStateFlow(
        HomeUiState(
            isBalanceHidden = preferences.isBalanceHidden(),
            accounts = preferences.getAccounts()
        )
    )
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        // Simulate initial 2-second skeleton loading (identical to inicio.html setTimeout)
        viewModelScope.launch {
            delay(2000)
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun selectTab(tab: HomeTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun selectBottomNav(item: BottomNavItem) {
        _uiState.update { it.copy(selectedBottomNav = item) }
    }

    fun toggleBalanceVisibility() {
        val newHiddenState = !_uiState.value.isBalanceHidden
        preferences.setBalanceHidden(newHiddenState)
        _uiState.update { it.copy(isBalanceHidden = newHiddenState) }
    }

    fun updateAccount(id: String, name: String, currency: String, balance: Double) {
        preferences.saveAccount(id, name, currency, balance)
        _uiState.update {
            it.copy(accounts = preferences.getAccounts())
        }
    }

    fun reloadAccounts() {
        _uiState.update {
            it.copy(accounts = preferences.getAccounts())
        }
    }
}

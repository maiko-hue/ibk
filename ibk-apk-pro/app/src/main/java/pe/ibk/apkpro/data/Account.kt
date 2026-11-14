package pe.ibk.apkpro.data

data class Account(
    val id: String,
    val name: String,
    val currency: String,
    val balance: Double,
    val subtitle: String = "Saldo disponible",
    val iconResName: String = "cuenta_ahorro"
) {
    fun getFormattedBalance(): String {
        return "$currency ${String.format("%,.2f", balance)}"
    }

    fun getHiddenBalance(): String {
        return "$currency ••••••••"
    }
}

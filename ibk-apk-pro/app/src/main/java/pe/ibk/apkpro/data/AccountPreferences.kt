package pe.ibk.apkpro.data

import android.content.Context
import android.content.SharedPreferences

class AccountPreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("ibk_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_ACC1_NAME = "ibk_acc1_name"
        private const val KEY_ACC1_CURR = "ibk_acc1_curr"
        private const val KEY_ACC1_BAL = "ibk_acc1_bal"

        private const val KEY_ACC2_NAME = "ibk_acc2_name"
        private const val KEY_ACC2_CURR = "ibk_acc2_curr"
        private const val KEY_ACC2_BAL = "ibk_acc2_bal"

        private const val KEY_EYE_HIDDEN = "ibk_eye_hidden"
    }

    fun getAccounts(): List<Account> {
        val acc1Name = prefs.getString(KEY_ACC1_NAME, "Cuenta Simple Soles") ?: "Cuenta Simple Soles"
        val acc1Curr = prefs.getString(KEY_ACC1_CURR, "S/") ?: "S/"
        val acc1Bal = prefs.getString(KEY_ACC1_BAL, "1000.00")?.toDoubleOrNull() ?: 1000.00

        val acc2Name = prefs.getString(KEY_ACC2_NAME, "Cuenta Simple Dólares") ?: "Cuenta Simple Dólares"
        val acc2Curr = prefs.getString(KEY_ACC2_CURR, "$") ?: "$"
        val acc2Bal = prefs.getString(KEY_ACC2_BAL, "1000.00")?.toDoubleOrNull() ?: 1000.00

        return listOf(
            Account(id = "1", name = acc1Name, currency = acc1Curr, balance = acc1Bal, iconResName = "cuenta_ahorro"),
            Account(id = "2", name = acc2Name, currency = acc2Curr, balance = acc2Bal, iconResName = "cuenta_ahorro")
        )
    }

    fun saveAccount(id: String, name: String, currency: String, balance: Double) {
        val editor = prefs.edit()
        if (id == "1") {
            editor.putString(KEY_ACC1_NAME, name)
            editor.putString(KEY_ACC1_CURR, currency)
            editor.putString(KEY_ACC1_BAL, balance.toString())
        } else if (id == "2") {
            editor.putString(KEY_ACC2_NAME, name)
            editor.putString(KEY_ACC2_CURR, currency)
            editor.putString(KEY_ACC2_BAL, balance.toString())
        }
        editor.apply()
    }

    fun isBalanceHidden(): Boolean {
        // By default, balances are hidden (eye closed) like in the web app
        return prefs.getBoolean(KEY_EYE_HIDDEN, true)
    }

    fun setBalanceHidden(hidden: Boolean) {
        prefs.edit().putBoolean(KEY_EYE_HIDDEN, hidden).apply()
    }
}

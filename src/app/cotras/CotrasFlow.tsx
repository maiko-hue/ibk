"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  name: string;
  curr: string;
  bal: string;
  num: string;
}

const DEFAULTS: Account[] = [
  { id: 1, name: "Cuenta Simple Soles", curr: "S/", bal: "1000.00", num: "191 2058951088" },
  { id: 2, name: "Cuenta Simple Dolares", curr: "US$", bal: "1000.00", num: "191 2058956625" },
  { id: 3, name: "Cuenta de Ahorros", curr: "S/", bal: "1000.00", num: "191 2058959941" },
];

export default function CotrasFlow() {
  const router = useRouter();

  // Multi-step view: "destino" | "monto" | "confirmacion"
  const [currentView, setCurrentView] = useState<"destino" | "monto" | "confirmacion">("destino");

  // Step 1: Destino
  const [tab, setTab] = useState<"interbank" | "otrobanco" | "exterior">("interbank");
  const [numCuenta, setNumCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [banco, setBanco] = useState("");

  // Step 2: Monto & Cuenta Cargo
  const [accounts, setAccounts] = useState<Account[]>(DEFAULTS);
  const [currency, setCurrency] = useState<"S/" | "US$">("S/");
  const [monto, setMonto] = useState("");
  const [selectedOriginId, setSelectedOriginId] = useState<number | null>(null);
  const [tempOriginId, setTempOriginId] = useState<number | null>(null);

  // Modals & Loaders
  const [isModalAccountsOpen, setIsModalAccountsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load accounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loaded: Account[] = DEFAULTS.map((def, idx) => {
        const i = idx + 1;
        const name = localStorage.getItem(`ibk_acc${i}_name`) || def.name;
        const curr = localStorage.getItem(`ibk_acc${i}_curr`) || def.curr;
        const bal = localStorage.getItem(`ibk_acc${i}_bal`) || def.bal;
        const num = localStorage.getItem(`ibk_acc${i}_num`) || def.num;
        return { id: i, name, curr, bal, num };
      });
      setAccounts(loaded);
    }
  }, []);

  const formatBalance = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleBack = () => {
    if (currentView === "confirmacion") {
      setCurrentView("monto");
    } else if (currentView === "monto") {
      setCurrentView("destino");
    } else {
      router.push("/trans");
    }
  };

  // Validación Step 1
  const isDestinoValid = (() => {
    const cleanNum = numCuenta.replace(/\s/g, "");
    const titularOk = titular.trim().length > 0;
    if (tab === "interbank") {
      return cleanNum.length > 5 && titularOk;
    } else if (tab === "otrobanco") {
      return cleanNum.length > 10 && titularOk && banco.trim().length > 0;
    } else {
      return cleanNum.length > 5 && titularOk;
    }
  })();

  // Entrada de monto tipo cajero (desplazamiento automático de decimales)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/\D/g, "");
    if (!cleanDigits || parseInt(cleanDigits, 10) === 0) {
      setMonto("");
      return;
    }
    if (cleanDigits.length > 9) return;
    const centsVal = parseInt(cleanDigits, 10);
    const formatted = (centsVal / 100).toFixed(2);
    setMonto(formatted);
  };

  // Cambio de divisa
  const handleCurrencyToggle = (newCurr: "S/" | "US$") => {
    setCurrency(newCurr);
    if (selectedOrigin && selectedOrigin.curr !== newCurr) {
      const compatible = accounts.find((a) => a.curr === newCurr);
      setSelectedOriginId(compatible ? compatible.id : null);
    }
  };

  const selectedOrigin = accounts.find((a) => a.id === selectedOriginId);
  const isMontoValid = parseFloat(monto) > 0 && selectedOriginId !== null;

  const handleOpenAccountModal = () => {
    const compatible = accounts.find((a) => a.curr === currency);
    setTempOriginId(selectedOriginId || (compatible ? compatible.id : 1));
    setIsModalAccountsOpen(true);
  };

  const handleSelectTempOrigin = (acc: Account) => {
    // Si la divisa fijada es dólares, no dejar seleccionar cuentas en soles
    if (currency === "US$" && acc.curr !== "US$") {
      alert("No puedes elegir una cuenta en soles porque el monto está configurado en dólares (US$).");
      return;
    }

    if (acc.curr === "US$") {
      setCurrency("US$");
    } else if (acc.curr === "S/") {
      setCurrency("S/");
    }

    setTempOriginId(acc.id);
  };

  const handleConfirmOrigin = () => {
    if (tempOriginId !== null) {
      setSelectedOriginId(tempOriginId);
      const chosen = accounts.find((a) => a.id === tempOriginId);
      if (chosen) {
        setCurrency(chosen.curr as "S/" | "US$");
      }
    }
    setIsModalAccountsOpen(false);
  };

  const handleProcesarTransferenciaOtras = () => {
    if (!selectedOrigin) return;

    const montoFloat = parseFloat(monto) || 0;
    const formattedMonto = montoFloat.toFixed(2);

    if (typeof window !== "undefined") {
      // 1. Guardar datos para el comprobante
      localStorage.setItem("ibk_cotras_cargo_name", selectedOrigin.name);
      localStorage.setItem("ibk_cotras_cargo_num", selectedOrigin.num);
      localStorage.setItem("ibk_cotras_dest_name", titular.trim());
      localStorage.setItem("ibk_cotras_dest_num", numCuenta.trim());

      if (tab === "otrobanco" && banco.trim()) {
        localStorage.setItem("ibk_cotras_dest_banco", banco.trim());
      } else {
        localStorage.removeItem("ibk_cotras_dest_banco");
      }

      localStorage.setItem("ibk_cotras_monto", formattedMonto);
      localStorage.setItem("ibk_cotras_currency", currency);
      localStorage.setItem("ibk_cotras_tab", tab);

      // 2. Descontar de cuenta de cargo
      const saldoActual = parseFloat(localStorage.getItem(`ibk_acc${selectedOrigin.id}_bal`) || selectedOrigin.bal) || 0;
      const nuevoSaldo = (saldoActual - montoFloat).toFixed(2);
      localStorage.setItem(`ibk_acc${selectedOrigin.id}_bal`, nuevoSaldo);

      // 3. Registrar en historial de movimientos por separado
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
      const opCode = Math.floor(10000000 + Math.random() * 90000000).toString();

      const existingMovs = JSON.parse(localStorage.getItem("ibk_movimientos") || "[]");
      const nuevoMov = {
        id: "mov_" + Date.now(),
        tipo: `Transferencia a ${titular.trim()}`,
        monto: -montoFloat,
        currency: currency,
        date: dateStr,
        opCode: opCode,
        accountId: String(selectedOrigin.id),
        accountName: selectedOrigin.name,
      };

      existingMovs.unshift(nuevoMov);
      localStorage.setItem("ibk_movimientos", JSON.stringify(existingMovs));
    }

    setIsLoading(true);

    setTimeout(() => {
      router.push("/exitocotras");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white text-[#333333] select-none flex flex-col font-sans">
      {/* ==================================================
          PANTALLA DE CARGA (SPINNER OFICIAL)
          ================================================== */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 z-[9999] flex flex-col justify-center items-center">
          <div className="relative w-20 h-20 flex justify-center items-center">
            <div className="absolute w-full h-full rounded-full border-4 border-[#f0f0f0]"></div>
            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-[#00B14F] animate-spin"></div>
            <img src="/img/icon.webp" alt="Cargando" className="w-9 h-9 object-contain z-10" />
          </div>
        </div>
      )}

      {/* ==================================================
          HEADER
          ================================================== */}
      <header className="flex justify-between items-center px-4 py-3.5 bg-white flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)] z-10">
        <button
          type="button"
          onClick={handleBack}
          className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 w-8 h-8 active:scale-95 transition"
        >
          <svg className="w-5 h-5 stroke-[#00B14F] stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="text-[17px] font-bold text-[#111111] flex-grow text-center">Transferencias</div>
        <div className="w-8"></div>
      </header>

      {/* ==================================================
          VISTA 1: FORMULARIO DESTINO (TABS)
          ================================================== */}
      {currentView === "destino" && (
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {/* Pestañas: Interbank / Otro Banco / Exterior */}
            <div className="flex border border-[#ddd] rounded-[6px] overflow-hidden mb-7">
              <button
                type="button"
                onClick={() => setTab("interbank")}
                className={`flex-1 py-3 text-center text-[13.5px] font-semibold border-none cursor-pointer transition ${
                  tab === "interbank" ? "bg-[#00b551] text-white" : "bg-white text-[#666]"
                }`}
              >
                Interbank
              </button>
              <button
                type="button"
                onClick={() => setTab("otrobanco")}
                className={`flex-1 py-3 text-center text-[13.5px] font-semibold border-none border-l border-r border-[#ddd] cursor-pointer transition ${
                  tab === "otrobanco" ? "bg-[#00b551] text-white" : "bg-white text-[#666]"
                }`}
              >
                Otro Banco
              </button>
              <button
                type="button"
                onClick={() => setTab("exterior")}
                className={`flex-1 py-3 text-center text-[13.5px] font-semibold border-none cursor-pointer transition ${
                  tab === "exterior" ? "bg-[#00b551] text-white" : "bg-white text-[#666]"
                }`}
              >
                Al exterior
              </button>
            </div>

            {/* Input Número de Cuenta */}
            <div className="mb-6">
              <label className="text-[14px] text-[#111] font-bold mb-2 block">
                Ingresa número de cuenta de tipo
              </label>
              <input
                type="tel"
                value={numCuenta}
                onChange={(e) => setNumCuenta(e.target.value)}
                placeholder={
                  tab === "interbank"
                    ? "0000 0000000000"
                    : tab === "otrobanco"
                    ? "Código interbancario (CCI)"
                    : "Código SWIFT o IBAN"
                }
                autoComplete="off"
                className="w-full border-b border-[#f0f0f0] py-2.5 text-[15px] text-[#333] outline-none focus:border-[#00b551] transition placeholder-[#aaa]"
              />
            </div>

            {/* Input Titular */}
            <div className="mb-6">
              <label className="text-[14px] text-[#111] font-bold mb-2 block">
                Ingresa el titular de la cuenta
              </label>
              <input
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Nombre de la persona"
                autoComplete="off"
                className="w-full border-b border-[#f0f0f0] py-2.5 text-[15px] text-[#333] outline-none focus:border-[#00b551] transition placeholder-[#aaa]"
              />
            </div>

            {/* Input Destino Banco (solo en tab Otro Banco) */}
            {tab === "otrobanco" && (
              <div className="mb-6">
                <label className="text-[14px] text-[#111] font-bold mb-2 block">
                  Ingresa el destino
                </label>
                <input
                  type="text"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  placeholder="Nombre del banco"
                  autoComplete="off"
                  className="w-full border-b border-[#f0f0f0] py-2.5 text-[15px] text-[#333] outline-none focus:border-[#00b551] transition placeholder-[#aaa]"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isDestinoValid) setCurrentView("monto");
            }}
            disabled={!isDestinoValid}
            className={`w-full py-4 rounded-[8px] text-[16px] font-bold border-none transition cursor-pointer mb-4 ${
              isDestinoValid
                ? "bg-[#04BE4F] text-white active:bg-[#03a042]"
                : "bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* ==================================================
          VISTA 2: MONTO Y CUENTA DE CARGO
          ================================================== */}
      {currentView === "monto" && (
        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="text-[15px] text-[#555] mb-6 font-medium">A {numCuenta}</div>

            <span className="text-[14px] text-[#111] font-bold mb-2.5 block">Elige la moneda</span>
            <div className="flex border border-[#e0e0e0] rounded-[6px] overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => handleCurrencyToggle("S/")}
                className={`flex-1 py-3 text-[14px] font-semibold border-none cursor-pointer transition ${
                  currency === "S/" ? "bg-[#04BE4F] text-white" : "bg-[#f9f9f9] text-[#888]"
                }`}
              >
                Soles
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyToggle("US$")}
                className={`flex-1 py-3 text-[14px] font-semibold border-none cursor-pointer transition ${
                  currency === "US$" ? "bg-[#04BE4F] text-white" : "bg-[#f9f9f9] text-[#888]"
                }`}
              >
                Dólares
              </button>
            </div>

            <span className="text-[14px] text-[#111] font-bold mb-2 block">Ingresa el monto a transferir</span>
            <div className="flex items-center border-b border-[#e0e0e0] pb-1.5 mb-6 focus-within:border-[#00B14F] transition">
              <span className="text-[26px] font-medium text-[#333] mr-2">{currency}</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={monto}
                onChange={handleAmountChange}
                className="border-none bg-transparent text-[26px] font-medium text-[#333] w-full outline-none placeholder-[#ccc]"
              />
            </div>

            <span className="text-[13px] text-[#666] font-medium mb-2.5 block">Transfiere desde</span>
            <div
              onClick={handleOpenAccountModal}
              className={`border rounded-[8px] p-4 flex justify-between items-center mb-3 cursor-pointer transition ${
                selectedOrigin ? "border-[#00B14F] bg-[#fafffb]" : "border-[#e0e0e0] bg-white"
              }`}
            >
              <div className="flex flex-col">
                <div className="text-[15px] text-[#111] font-semibold">
                  {selectedOrigin ? selectedOrigin.name : "Elige la cuenta"}
                </div>
                {selectedOrigin && (
                  <div className="text-[13px] text-[#666] mt-0.5">
                    Saldo: {selectedOrigin.curr} {formatBalance(selectedOrigin.bal)}
                  </div>
                )}
              </div>
              <div className="text-[#00B14F] font-semibold text-[14px]">
                {selectedOrigin ? "Cambiar" : "Seleccionar"}
              </div>
            </div>

            <div className="text-[12px] text-[#444] mb-8 text-center">
              Tipo de cambio ref. Compra: <strong>3.468</strong> Venta: <strong>3.603</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isMontoValid) setCurrentView("confirmacion");
            }}
            disabled={!isMontoValid}
            className={`w-full py-4 rounded-[8px] text-[16px] font-bold border-none transition cursor-pointer mb-4 ${
              isMontoValid
                ? "bg-[#04BE4F] text-white active:bg-[#03a042]"
                : "bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* ==================================================
          VISTA 3: CONFIRMACIÓN
          ================================================== */}
      {currentView === "confirmacion" && selectedOrigin && (
        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="text-center my-4 mb-6">
              <div className="text-[20px] text-[#111] font-normal leading-snug">
                Estas a un paso de<br />
                <strong className="font-extrabold">realizar tu transferencia</strong>
              </div>
            </div>

            <div className="text-[15px] text-[#111] font-semibold mb-5">Confirma la información</div>

            {/* Cuenta a Cargo */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">CUENTA A CARGO</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] text-[#111] font-normal">{selectedOrigin.name}</span>
                <span className="text-[#666] text-[13.5px]">{selectedOrigin.num}</span>
              </div>
            </div>

            {/* Cuenta Destino */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">CUENTA DESTINO</div>
              <div className="flex flex-col gap-0.5">
                {tab === "otrobanco" && banco.trim() && (
                  <span className="text-[14px] text-[#111] font-semibold">{banco}</span>
                )}
                <span className="text-[15px] text-[#111] font-normal">{titular}</span>
                <span className="text-[#666] text-[13.5px]">{numCuenta}</span>
              </div>
            </div>

            {/* Moneda y Monto */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">MONEDA Y MONTO</div>
              <div className="text-[16px] text-[#111] font-bold">
                {currency} {parseFloat(monto || "0").toFixed(2)}
              </div>
            </div>

            {/* Comisión */}
            <div className="mb-4">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">COMISIÓN</div>
              <div data-gratis-badge="true" className="badge-gratis">
                GRATIS
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProcesarTransferenciaOtras}
            className="w-full py-4 rounded-[8px] text-[16px] font-bold bg-[#04BE4F] text-white active:bg-[#03a042] transition cursor-pointer border-none mb-4"
          >
            Confirmar
          </button>
        </div>
      )}

      {/* ==================================================
          MODAL BOTTOM SHEET: SELECCIÓN DE CUENTA DE CARGO
          ================================================== */}
      {isModalAccountsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-end justify-center">
          <div className="bg-white w-full max-w-[480px] rounded-t-[20px] p-6 max-h-[80vh] flex flex-col animate-slideUp">
            <div className="text-[15px] font-bold text-[#111] mb-5 text-center">
              Seleccione la cuenta de cargo
            </div>

            <div className="overflow-y-auto mb-5 flex-1">
              {accounts.map((acc) => {
                const isSelected = tempOriginId === acc.id;
                // Si la divisa está en dólares, bloquear cuentas en soles
                const isBlocked = currency === "US$" && acc.curr !== "US$";

                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      if (!isBlocked) {
                        handleSelectTempOrigin(acc);
                      }
                    }}
                    className={`border rounded-[10px] p-4 mb-3 flex justify-between items-center transition ${
                      isBlocked
                        ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                        : isSelected
                        ? "border-[#00B14F] bg-[#fafffb] cursor-pointer"
                        : "border-[#f0f0f0] bg-white cursor-pointer hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-bold text-[#111]">{acc.name}</span>
                        {isBlocked && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                            Moneda diferente
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-[#777] mt-0.5">
                        Saldo: {acc.curr} {formatBalance(acc.bal)}
                      </div>
                    </div>
                    <div
                      className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                        isBlocked
                          ? "border-gray-300 bg-gray-100"
                          : isSelected
                          ? "border-[#00B14F]"
                          : "border-[#ccc]"
                      }`}
                    >
                      {isSelected && !isBlocked && <div className="w-2.5 h-2.5 rounded-full bg-[#00B14F]"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleConfirmOrigin}
              className="w-full py-4 rounded-[10px] text-[16px] font-bold bg-[#04BE4F] text-white active:bg-[#03a042] transition cursor-pointer border-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

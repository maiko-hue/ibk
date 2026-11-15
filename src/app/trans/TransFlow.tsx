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

export default function TransFlow() {
  const router = useRouter();

  // Multi-step view: "menu" | "monto" | "destino" | "confirmacion"
  const [currentView, setCurrentView] = useState<"menu" | "monto" | "destino" | "confirmacion">("menu");

  // State
  const [accounts, setAccounts] = useState<Account[]>(DEFAULTS);
  const [currency, setCurrency] = useState<"S/" | "US$">("S/");
  const [monto, setMonto] = useState<string>("");
  const [selectedOriginId, setSelectedOriginId] = useState<number | null>(null);
  const [tempOriginId, setTempOriginId] = useState<number | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<number | null>(null);

  // Modals & Loaders
  const [isModalAccountsOpen, setIsModalAccountsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load account balances from localStorage
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
      setCurrentView("destino");
    } else if (currentView === "destino") {
      setCurrentView("monto");
    } else if (currentView === "monto") {
      setCurrentView("menu");
    } else {
      router.push("/inicio");
    }
  };

  // Cambio de divisa desde los botones Soles / Dólares
  const handleCurrencyToggle = (newCurr: "S/" | "US$") => {
    setCurrency(newCurr);
    // Si la cuenta de origen actual está en otra divisa, limpiar o sincronizar
    if (selectedOrigin && selectedOrigin.curr !== newCurr) {
      const compatible = accounts.find((a) => a.curr === newCurr);
      setSelectedOriginId(compatible ? compatible.id : null);
    }
  };

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

  const selectedOrigin = accounts.find((a) => a.id === selectedOriginId);
  const selectedDest = accounts.find((a) => a.id === selectedDestId);
  const isMontoValido = parseFloat(monto) > 0 && selectedOriginId !== null;

  const handleOpenAccountModal = () => {
    // Si ya hay una cuenta seleccionada compatible, usarla como temporal; de lo contrario buscar compatible
    const compatible = accounts.find((a) => a.curr === currency);
    setTempOriginId(selectedOriginId || (compatible ? compatible.id : 1));
    setIsModalAccountsOpen(true);
  };

  const handleSelectTempOrigin = (acc: Account) => {
    // Regla: si el monto está en dólares, no permitir elegir cuentas en soles
    if (currency === "US$" && acc.curr !== "US$") {
      alert("No puedes elegir una cuenta en soles porque el monto está configurado en dólares (US$).");
      return;
    }

    // Al cambiar la cuenta a dólares, el símbolo de divisa cambia automáticamente a US$
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

  const handleSelectDest = (destId: number) => {
    setSelectedDestId(destId);
    setCurrentView("confirmacion");
  };

  const handleProcesarTransferencia = () => {
    if (!selectedOrigin || !selectedDest) return;

    const montoFloat = parseFloat(monto) || 0;
    const formattedMonto = montoFloat.toFixed(2);

    if (typeof window !== "undefined") {
      // 1. Guardar datos para el voucher
      localStorage.setItem("ibk_trans_cargo_name", selectedOrigin.name);
      localStorage.setItem("ibk_trans_cargo_num", selectedOrigin.num);
      localStorage.setItem("ibk_trans_dest_name", selectedDest.name);
      localStorage.setItem("ibk_trans_dest_num", selectedDest.num);
      localStorage.setItem("ibk_trans_monto", formattedMonto);
      localStorage.setItem("ibk_trans_currency", currency);

      // 2. Descontar de cuenta de origen
      const saldoOrigenActual = parseFloat(localStorage.getItem(`ibk_acc${selectedOrigin.id}_bal`) || selectedOrigin.bal) || 0;
      const nuevoSaldoOrigen = (saldoOrigenActual - montoFloat).toFixed(2);
      localStorage.setItem(`ibk_acc${selectedOrigin.id}_bal`, nuevoSaldoOrigen);

      // 3. Sumar a cuenta de destino
      const saldoDestinoActual = parseFloat(localStorage.getItem(`ibk_acc${selectedDest.id}_bal`) || selectedDest.bal) || 0;
      const nuevoSaldoDestino = (saldoDestinoActual + montoFloat).toFixed(2);
      localStorage.setItem(`ibk_acc${selectedDest.id}_bal`, nuevoSaldoDestino);

      // 4. Registrar en historial de movimientos por separado
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
      const opCode = Math.floor(10000000 + Math.random() * 90000000).toString();

      const existingMovs = JSON.parse(localStorage.getItem("ibk_movimientos") || "[]");

      // Movimiento para cuenta origen (Gasto)
      const movOrigen = {
        id: "mov_" + Date.now() + "_orig",
        tipo: `Transf. a ${selectedDest.name}`,
        monto: -montoFloat,
        currency: currency,
        date: dateStr,
        opCode: opCode,
        accountId: String(selectedOrigin.id),
        accountName: selectedOrigin.name,
      };

      // Movimiento para cuenta destino (Ingreso)
      const movDestino = {
        id: "mov_" + (Date.now() + 1) + "_dest",
        tipo: `Transf. de ${selectedOrigin.name}`,
        monto: montoFloat,
        currency: currency,
        date: dateStr,
        opCode: opCode,
        accountId: String(selectedDest.id),
        accountName: selectedDest.name,
      };

      existingMovs.unshift(movDestino);
      existingMovs.unshift(movOrigen);
      localStorage.setItem("ibk_movimientos", JSON.stringify(existingMovs));
    }

    setIsLoading(true);

    setTimeout(() => {
      router.push("/exitotrans");
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
          VISTA 1: MENÚ OPCIONES
          ================================================== */}
      {currentView === "menu" && (
        <div className="flex-1 p-5 bg-[#fafbfc]">
          {/* Opción 1: Entre mis cuentas */}
          <div
            onClick={() => setCurrentView("monto")}
            className="bg-white rounded-[10px] p-[16px_15px] mb-3 flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9] transition"
          >
            <img
              src="/img/transferencias.jpg"
              alt="Entre mis cuentas"
              className="w-[26px] h-[26px] mr-3.5 object-contain flex-shrink-0"
            />
            <div className="flex-1 text-[15px] font-semibold text-[#111]">Entre mis cuentas</div>
            <div className="text-[#00B14F] text-[24px] font-extrabold scale-y-125">›</div>
          </div>

          {/* Opción 2: A otras cuentas */}
          <div
            onClick={() => router.push('/cotras')}
            className="bg-white rounded-[10px] p-[16px_15px] mb-3 flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9] transition"
          >
            <img
              src="/img/transferencias.jpg"
              alt="A otras cuentas"
              className="w-[26px] h-[26px] mr-3.5 object-contain flex-shrink-0"
            />
            <div className="flex-1 text-[15px] font-semibold text-[#111]">A otras cuentas</div>
            <div className="text-[#00B14F] text-[24px] font-extrabold scale-y-125">›</div>
          </div>
        </div>
      )}

      {/* ==================================================
          VISTA 2: FORMULARIO DE MONTO Y CUENTA CARGO
          ================================================== */}
      {currentView === "monto" && (
        <div className="flex-1 p-5 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[14px] text-[#111] font-semibold mb-2.5 block">Elige la moneda</span>
            <div className="flex border border-[#e0e0e0] rounded-[8px] overflow-hidden mb-6">
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

            <span className="text-[14px] text-[#111] font-semibold mb-2 block">Ingresa el monto a transferir</span>
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
              className={`border rounded-[10px] p-4 flex justify-between items-center mb-3 cursor-pointer transition ${
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
              if (isMontoValido) setCurrentView("destino");
            }}
            disabled={!isMontoValido}
            className={`w-full py-4 rounded-[10px] text-[16px] font-bold border-none transition cursor-pointer mt-6 mb-4 ${
              isMontoValido
                ? "bg-[#04BE4F] text-white active:bg-[#03a042]"
                : "bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* ==================================================
          VISTA 3: ELIGE CUENTA DESTINO
          ================================================== */}
      {currentView === "destino" && (
        <div className="flex-1 p-5 pt-6 bg-[#fafbfc]">
          <span className="text-[15px] font-bold text-[#111] mb-5 block">Elige la cuenta de destino</span>

          {accounts
            .filter((acc) => acc.id !== selectedOriginId)
            .map((acc) => (
              <div
                key={acc.id}
                onClick={() => handleSelectDest(acc.id)}
                className="bg-white rounded-[10px] p-4 mb-3.5 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f0f0] cursor-pointer active:bg-[#f9f9f9] transition"
              >
                <img
                  src="/img/target.jpg"
                  alt="Icono Cuenta"
                  className="w-[55px] h-[40px] object-cover rounded-[6px] mr-3.5 shadow-[0_2px_5px_rgba(0,0,0,0.1)] flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-[14px] text-[#111] font-normal mb-0.5">{acc.name}</div>
                  <div className="text-[16px] font-bold text-[#111]">
                    {acc.curr} {formatBalance(acc.bal)}
                  </div>
                </div>
                <div className="text-[#00B14F] text-[22px] font-bold">›</div>
              </div>
            ))}
        </div>
      )}

      {/* ==================================================
          VISTA 4: CONFIRMACIÓN
          ================================================== */}
      {currentView === "confirmacion" && selectedOrigin && selectedDest && (
        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="text-center my-4 mb-6">
              <div className="text-[22px] text-[#111] font-normal leading-snug">
                Estas a un paso de<br />
                <strong className="font-extrabold">realizar tu transferencia</strong>
              </div>
            </div>

            <div className="text-[15px] text-[#111] font-semibold mb-5">Confirma la información</div>

            {/* Fila: Cuenta a Cargo */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">CUENTA A CARGO</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] text-[#111] font-normal">{selectedOrigin.name}</span>
                <span className="text-[#666] text-[13.5px]">{selectedOrigin.num}</span>
              </div>
            </div>

            {/* Fila: Cuenta Destino */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">CUENTA DESTINO</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] text-[#111] font-normal">{selectedDest.name}</span>
                <span className="text-[#666] text-[13.5px]">{selectedDest.num}</span>
              </div>
            </div>

            {/* Fila: Moneda y Monto */}
            <div className="mb-4 border-b border-[#f0f0f0] pb-3">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">MONEDA Y MONTO</div>
              <div className="text-[16px] text-[#111] font-bold">
                {currency} {parseFloat(monto || "0").toFixed(2)}
              </div>
            </div>

            {/* Fila: Comisión */}
            <div className="mb-4">
              <div className="text-[12px] text-[#888] uppercase tracking-wider mb-1">COMISIÓN</div>
              <div data-gratis-badge="true" className="badge-gratis">
                GRATIS
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProcesarTransferencia}
            className="w-full py-4 rounded-[10px] text-[16px] font-bold bg-[#04BE4F] text-white active:bg-[#03a042] transition cursor-pointer border-none mb-4"
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
                // Si la divisa está fijada en dólares, bloquear cuentas en soles
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

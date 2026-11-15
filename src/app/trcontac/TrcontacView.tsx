"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { captureAndShareVoucher } from "@/lib/shareVoucher";

interface ContactItem {
  nombre: string;
  celular: string;
}

interface AccountOption {
  id: string;
  key: string;
  name: string;
  curr: string;
  bal: string;
}

const DEFAULT_CONTACTS: { letter: string; items: ContactItem[] }[] = [
  {
    letter: "A",
    items: [
      { nombre: "Alejandro Flores", celular: "963 267 495" },
      { nombre: "Andrea Torres", celular: "978 887 591" },
      { nombre: "Alonso Mendoza", celular: "982 096 595" },
      { nombre: "Adriana Rojas", celular: "990 015 181" },
    ],
  },
  {
    letter: "C",
    items: [
      { nombre: "Carlos Barbero", celular: "930 838 419" },
      { nombre: "Cesar", celular: "984 880 470" },
      { nombre: "Cja", celular: "915 078 000" },
      { nombre: "Colectivos Caja Piura", celular: "900 852 162" },
      { nombre: "Carlos Ruiz", celular: "999 888 777" },
    ],
  },
  {
    letter: "D",
    items: [
      { nombre: "Diego Franco", celular: "911 222 333" },
      { nombre: "Daniela Castro", celular: "954 112 304" },
    ],
  },
  {
    letter: "E",
    items: [{ nombre: "Elena Gómez", celular: "955 444 333" }],
  },
  {
    letter: "F",
    items: [
      { nombre: "Francisco Broncano", celular: "994 733 231" },
      { nombre: "Fernando Torres", celular: "966 777 888" },
    ],
  },
  {
    letter: "M",
    items: [
      { nombre: "Maikol E Crisanto H", celular: "921 534 010" },
      { nombre: "Marco Antonio Rios", celular: "912 345 678" },
    ],
  },
];

const DESTINOS = [
  "Plin",
  "Yape",
  "SIP",
  "Dale",
  "Bim",
  "Tunki",
  "Agora / Oh!",
  "BBVA",
  "Interbank",
  "Financiera Efectiva",
  "IziPay",
];

export default function TrcontacView() {
  const router = useRouter();

  // Vista activa: "search" | "monto" | "exito"
  const [currentView, setCurrentView] = useState<"search" | "monto" | "exito">("search");

  // Estado de búsqueda en primera pantalla
  const [searchQuery, setSearchQuery] = useState("");
  const [isNineDigits, setIsNineDigits] = useState(false);
  const [contactsData, setContactsData] = useState(DEFAULT_CONTACTS);

  // Destinatario seleccionado
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [destinoActual, setDestinoActual] = useState("Plin");
  const [mensajeOpcional, setMensajeOpcional] = useState("");

  // Monto
  const [monto, setMonto] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Cuentas del usuario y cuenta de cargo
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccIndex, setSelectedAccIndex] = useState(0);

  // Ocultar / Mostrar saldos
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Captura y compartir de constancia
  const [isCapturingVoucher, setIsCapturingVoucher] = useState(false);
  const captureVoucherRef = useRef<HTMLDivElement>(null);

  const handleSharePlin = async () => {
    const cleanNombre = (recipientName || "Plin").replace(/[^a-zA-Z0-9]/g, "_");
    await captureAndShareVoucher({
      captureElement: captureVoucherRef.current,
      fileName: `Constancia_Plin_${cleanNombre}.png`,
      title: `Constancia Plin a ${recipientName}`,
      text: `Plineo exitoso de S/ ${voucherData.montoFormatted} a ${recipientName}. Op: ${voucherData.opCode}`,
      onBeforeCapture: () => {
        setIsCapturingVoucher(true);
      },
      onAfterCapture: () => {
        setIsCapturingVoucher(false);
      },
    });
  };

  // Modales
  const [modalDestinosOpen, setModalDestinosOpen] = useState(false);
  const [modalCuentasOpen, setModalCuentasOpen] = useState(false);

  // Loader blanco con logo
  const [showLoader, setShowLoader] = useState(false);

  // Modo pago con QR
  const [isQrMode, setIsQrMode] = useState(false);

  // Datos del comprobante generado
  const [voucherData, setVoucherData] = useState({
    opCode: "80599827",
    dateFormatted: "",
    montoFormatted: "0.00",
    accountCargoName: "Cuenta Simple Soles",
    isQrMode: false,
    destino: "Plin",
  });

  // Notificación push simulada en comprobante
  const [showPushNotification, setShowPushNotification] = useState(false);

  // Cargar cuentas y contactos al inicio
  useEffect(() => {
    if (typeof window !== "undefined") {
      const acc1Name = localStorage.getItem("ibk_acc1_name") || "Cuenta Simple Soles";
      const acc1Curr = localStorage.getItem("ibk_acc1_curr") || "S/";
      const acc1Bal = localStorage.getItem("ibk_acc1_bal") || "1000.00";

      const acc2Name = localStorage.getItem("ibk_acc2_name") || "Cuenta Simple Dolares";
      const acc2Curr = localStorage.getItem("ibk_acc2_curr") || "US$";
      const acc2Bal = localStorage.getItem("ibk_acc2_bal") || "1000.00";

      const acc3Name = localStorage.getItem("ibk_acc3_name") || "Cuenta de Ahorros";
      const acc3Curr = localStorage.getItem("ibk_acc3_curr") || "S/";
      const acc3Bal = localStorage.getItem("ibk_acc3_bal") || "1000.00";

      const loadedAccs: AccountOption[] = [
        { id: "1", key: "ibk_acc1_bal", name: acc1Name, curr: acc1Curr, bal: acc1Bal },
        { id: "2", key: "ibk_acc2_bal", name: acc2Name, curr: acc2Curr, bal: acc2Bal },
        { id: "3", key: "ibk_acc3_bal", name: acc3Name, curr: acc3Curr, bal: acc3Bal },
      ];
      setAccounts(loadedAccs);

      // Cargar contactos de localStorage si existen
      try {
        const savedContacts: ContactItem[] = JSON.parse(
          localStorage.getItem("ibk_contactos") || "[]"
        );
        if (savedContacts.length > 0) {
          const map = new Map<string, ContactItem[]>();
          DEFAULT_CONTACTS.forEach((g) => map.set(g.letter, [...g.items]));

          savedContacts.forEach((c) => {
            if (!c.nombre) return;
            const letter = c.nombre.charAt(0).toUpperCase();
            const list = map.get(letter) || [];
            if (!list.some((x) => x.celular.replace(/\s/g, "") === c.celular.replace(/\s/g, ""))) {
              list.push({ nombre: c.nombre, celular: c.celular });
            }
            map.set(letter, list);
          });

          const sorted = Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, items]) => ({
              letter,
              items: items.sort((a, b) => a.nombre.localeCompare(b.nombre)),
            }));
          setContactsData(sorted);
        }
      } catch (e) {
        console.error("Error al cargar contactos:", e);
      }
    }
  }, []);

  const formatBalance = (amountStr: string) => {
    const num = parseFloat(amountStr) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currentSelectedAccount = accounts[selectedAccIndex] || {
    id: "1",
    key: "ibk_acc1_bal",
    name: "Cuenta Simple Soles",
    curr: "S/",
    bal: "1000.00",
  };

  // Manejar buscador principal
  const handleSearchChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setSearchQuery(clean);
    if (clean.length === 9) {
      setIsNineDigits(true);
      setRecipientPhone(clean);
    } else {
      setIsNineDigits(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsNineDigits(false);
  };

  // Buscar titular en Firebase Firestore / Bot
  const consultarTitular = async (phone: string, fallbackName = ""): Promise<string> => {
    if (phone.length !== 9) return fallbackName || phone;
    setShowLoader(true);

    try {
      // 1. Firebase Firestore en usuarios_yape
      const docRef = doc(db, "usuarios_yape", phone);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().nombre) {
        setShowLoader(false);
        return docSnap.data().nombre;
      }

      // 2. Si el bot de Telegram está activo
      const botActivo = localStorage.getItem("ibk_bot_telegram_activo") === "true";
      if (botActivo) {
        try {
          const res = await fetch(`/api/bot/${phone}`);
          const data = await res.json();
          if (data.status === "success" && data.nombre) {
            try {
              await setDoc(doc(db, "usuarios_yape", phone), { nombre: data.nombre });
            } catch (errDb) {
              console.error("Error al guardar en Firestore:", errDb);
            }
            setShowLoader(false);
            return data.nombre;
          }
        } catch (botErr) {
          console.error("Error consultando bot:", botErr);
        }
      }
    } catch (error) {
      console.error("Error consultando Firebase:", error);
    } finally {
      setShowLoader(false);
    }

    return fallbackName || `Usuario ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  // Iniciar flujo de pago al seleccionar contacto o presionar 9 dígitos
  const iniciarPago = async (phone: string, initialName?: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    setRecipientPhone(cleanPhone);
    setDestinoActual("Plin");
    setMonto("");
    setMensajeOpcional("");

    const nombreFinal = await consultarTitular(cleanPhone, initialName);
    setRecipientName(nombreFinal);
    setCurrentView("monto");

    // Enfocar automáticamente el teclado numérico en la pantalla de monto
    setTimeout(() => {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
    }, 150);
  };

  // Generar fecha y hora para comprobante: ej. "14 Nov 2026 · 07:03 PM"
  const obtenerFechaFormateada = () => {
    const date = new Date();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, "0");
    const ampm = horas >= 12 ? "PM" : "AM";
    horas = horas % 12;
    horas = horas ? horas : 12;
    const horasStr = horas.toString().padStart(2, "0");

    return `${dia} ${mes} ${anio} · ${horasStr}:${minutos} ${ampm}`;
  };

  // Confirmar y procesar Plineo
  const handlePlinear = () => {
    const montoNum = parseFloat(monto) || 0;
    if (montoNum <= 0) return;

    const opCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const dateStr = obtenerFechaFormateada();

    // 1. Descontar del saldo de la cuenta a cargo seleccionada
    const currentBalNum = parseFloat(currentSelectedAccount.bal) || 0;
    const nuevoSaldo = Math.max(0, currentBalNum - montoNum).toFixed(2);

    if (typeof window !== "undefined") {
      localStorage.setItem(currentSelectedAccount.key, nuevoSaldo);

      // Actualizar estado local
      const updatedAccs = [...accounts];
      updatedAccs[selectedAccIndex] = {
        ...currentSelectedAccount,
        bal: nuevoSaldo,
      };
      setAccounts(updatedAccs);

      // 2. Guardar en el historial de movimientos de la cuenta
      try {
        const movimientosPrevios = JSON.parse(
          localStorage.getItem("ibk_movimientos") || "[]"
        );
        const nuevoMov = {
          id: Date.now().toString(),
          title: recipientName,
          subtitle: `Plineo a ${destinoActual}`,
          amount: `-${montoNum.toFixed(2)}`,
          currency: "S/",
          date: dateStr,
          opCode: opCode,
          accountId: String(selectedAccIndex + 1),
          accountName: currentSelectedAccount.name,
          phone: recipientPhone,
          message: mensajeOpcional,
        };
        movimientosPrevios.unshift(nuevoMov);
        localStorage.setItem("ibk_movimientos", JSON.stringify(movimientosPrevios));
      } catch (errMov) {
        console.error("Error al registrar movimiento:", errMov);
      }

      localStorage.setItem("ibk_plin_isQR", String(isQrMode));
      localStorage.setItem("ibk_plin_monto", montoNum.toFixed(2));
      localStorage.setItem("ibk_plin_destino", destinoActual);
    }

    // 3. Preparar datos de comprobante
    setVoucherData({
      opCode: opCode,
      dateFormatted: dateStr,
      montoFormatted: montoNum.toFixed(2),
      accountCargoName: currentSelectedAccount.name,
      isQrMode: isQrMode,
      destino: destinoActual,
    });

    // 4. Cambiar a vista de comprobante exitoso
    setCurrentView("exito");

    // 5. Disparar notificación push falsa animada
    setShowPushNotification(true);
    setTimeout(() => {
      setShowPushNotification(false);
    }, 5500);
  };

  // Filtrado de contactos según búsqueda numérica
  const filteredContacts = contactsData
    .map((group) => {
      const items = group.items.filter((item) => {
        const clean = item.celular.replace(/\s/g, "");
        return clean.includes(searchQuery);
      });
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  const hasResults = filteredContacts.length > 0;
  const isMontoValido = parseFloat(monto) > 0;

  return (
    <div className="relative min-h-screen bg-white text-[#333333] select-none flex flex-col font-sans overflow-x-hidden">
      {/* ==================================================
          LOADER BLANCO CON LOGO OFICIAL
          ================================================== */}
      {showLoader && (
        <div className="fixed inset-0 bg-white z-[99999] flex justify-center items-center">
          <div className="relative w-16 h-16 flex justify-center items-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#00B14F] animate-spin z-[1]" />
            <img
              src="/img/icon.webp"
              alt="Cargando"
              className="w-8 h-8 object-contain z-[2] pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* ==================================================
          NOTIFICACIÓN PUSH FALSA ANIMADA (Comprobante)
          ================================================== */}
      {showPushNotification && currentView === "exito" && (
        <div
          onClick={() => setShowPushNotification(false)}
          className="fixed top-2 left-3 right-3 z-[100000] bg-[#1a1b1e] text-white px-3.5 py-2.5 rounded-[18px] shadow-2xl flex items-center justify-between border border-white/10 animate-slideDown cursor-pointer"
        >
          <div className="flex items-center min-w-0 mr-2">
            <img
              src="/img/interbank_wrdgas.webp"
              alt="Interbank"
              className="w-[30px] h-[30px] rounded-[6px] object-contain flex-shrink-0 mr-3 pointer-events-none"
            />
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-white leading-tight">Interbank</div>
              <div className="text-[11px] text-[#cccccc] font-normal truncate leading-tight">
                Plineaste S/ {voucherData.montoFormatted} a {recipientName}
              </div>
            </div>
          </div>
          <img
            src="/img/interbank_wrdgas.webp"
            alt="Interbank"
            className="w-[20px] h-[20px] rounded-[4px] object-contain flex-shrink-0 opacity-80 pointer-events-none"
          />
        </div>
      )}

      {/* ==================================================
          VISTA 1: PLINEAR (Buscador, Favoritos y Contactos)
          ================================================== */}
      {currentView === "search" && (
        <div className="flex-1 flex flex-col bg-white">
          {!isNineDigits ? (
            /* ESTADO NORMAL DE BÚSQUEDA */
            <div>
              {/* Header Verde Plinear */}
              <div className="bg-[#00B14F] px-4 pt-3.5 pb-6 rounded-b-[24px]">
                {/* Top Nav */}
                <div className="flex items-center justify-between mb-4">
                  <Link
                    href="/inicio"
                    className="w-[32px] h-[32px] bg-black/15 rounded-full flex items-center justify-center border-none flex-shrink-0 active:scale-90 transition"
                  >
                    <svg className="w-4 h-4 stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round fill-none" viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </Link>
                  <div className="text-white text-[16px] font-bold flex-1 ml-3">Plinear</div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 stroke-white stroke-2 fill-none flex-shrink-0" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <button
                      type="button"
                      onClick={() => router.push("/config")}
                      className="w-[32px] h-[32px] flex items-center justify-center bg-transparent border-none cursor-pointer pointer-events-auto active:scale-90 transition p-0"
                    >
                      <svg className="w-5 h-5 stroke-white stroke-2 fill-none flex-shrink-0 pointer-events-none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Fila Buscador + QR */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 bg-white rounded-full flex items-center px-3.5 py-2.5 min-w-0 shadow-sm">
                    <svg className="w-4 h-4 stroke-[#333] stroke-[2.5] fill-none flex-shrink-0" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="tel"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Busca celular o contacto"
                      maxLength={9}
                      autoComplete="off"
                      className="border-none outline-none w-full ml-2 text-[13.5px] bg-transparent text-[#333] placeholder-[#777]"
                    />
                  </div>
                  <div className="w-[42px] h-[42px] bg-[#0137AB] rounded-full flex justify-center items-center flex-shrink-0 shadow-[0_4px_10px_rgba(1,55,171,0.4)] active:scale-95 transition cursor-pointer">
                    <img src="/img/qr.png" alt="QR" className="w-5 h-5 object-contain pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Fila Horizontal de Favoritos (Captura 1) */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col items-center flex-shrink-0 cursor-pointer group active:scale-95 transition">
                      <div className="w-[50px] h-[50px] rounded-[14px] border-[1.5px] border-[#002D72] flex items-center justify-center bg-white mb-1.5 shadow-sm">
                        <svg className="w-5 h-5 stroke-[#002D72] stroke-[2.5] fill-none" viewBox="0 0 24 24">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span className="text-[10px] text-[#333] text-center font-semibold leading-tight">
                        Agregar<br />favorito
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarjeta de Saldo Disponible (Captura 1) */}
              <div className="mx-4 my-3 bg-white rounded-[14px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#eef0f3] flex justify-between items-center">
                <div>
                  <div className="text-[17px] font-extrabold text-[#111] mb-0.5">
                    {isBalanceHidden ? "S/ ••••••••" : `S/ ${formatBalance(currentSelectedAccount.bal)}`}
                  </div>
                  <div className="text-[11.5px] text-[#666]">Saldo disponible</div>
                </div>
                <div
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="w-[34px] h-[34px] rounded-full border border-[#0039A6] flex justify-center items-center cursor-pointer flex-shrink-0 active:scale-90 transition"
                >
                  <svg className="w-4 h-4 stroke-[#0039A6] stroke-2 fill-none" viewBox="0 0 24 24">
                    {isBalanceHidden ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Sección Tus Contactos (Captura 1) */}
              <div className="text-[15px] font-bold text-[#00B14F] px-4 pt-2 mb-1">
                Tus contactos
              </div>

              <div className="px-4 pb-10 divide-y divide-[#f5f5f5]">
                {hasResults ? (
                  filteredContacts.map((group) => (
                    <div key={group.letter}>
                      {group.items.map((contact, idx) => (
                        <div
                          key={idx}
                          onClick={() => iniciarPago(contact.celular, contact.nombre)}
                          className="py-3 flex justify-between items-center cursor-pointer active:bg-gray-50 transition"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="text-[13.5px] font-bold text-[#111] mb-0.5 truncate">
                              {contact.nombre}
                            </div>
                            <div className="text-[12px] text-[#666] font-normal">
                              {contact.celular}
                            </div>
                          </div>
                          <svg className="w-4 h-4 stroke-[#111] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round flex-shrink-0" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#888] text-[13.5px]">
                    No se encontraron contactos.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ESTADO 9 DÍGITOS */
            <div className="p-4 bg-white min-h-screen">
              <div className="flex justify-between items-center border border-[#e0e0e0] rounded-full py-1.5 px-3 mb-6">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="w-7 h-7 bg-[#f5f6f8] rounded-full flex justify-center items-center border-none cursor-pointer active:scale-90 transition"
                >
                  <svg className="w-4 h-4 stroke-[#333] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="text-[15px] font-medium text-[#333] flex-1 ml-3">
                  {searchQuery}
                </span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="bg-transparent border-none font-bold text-[16px] text-[#333] cursor-pointer px-1.5"
                >
                  ✕
                </button>
              </div>

              <div className="text-[#00B14F] text-[16px] font-bold mb-4">
                Plinear a nuevo número de celular
              </div>

              <div
                onClick={() => iniciarPago(searchQuery)}
                className="flex justify-between items-center cursor-pointer py-2 active:bg-gray-50 transition border-b border-[#f5f5f5]"
              >
                <div>
                  <div className="text-[14.5px] font-bold text-black mb-0.5">
                    {`${searchQuery.slice(0, 3)} ${searchQuery.slice(3, 6)} ${searchQuery.slice(6, 9)}`}
                  </div>
                  <div className="text-[12px] text-[#666]">
                    No necesitas guardarlo en tus contactos.
                  </div>
                </div>
                <svg className="w-4 h-4 stroke-black stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              {/* Opción Es pago con QR */}
              <div
                onClick={() => setIsQrMode(!isQrMode)}
                className="flex items-center gap-2 mt-4 px-1 cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                    isQrMode ? "bg-[#00B14F] border-[#00B14F]" : "border-[#ccc] bg-white"
                  }`}
                >
                  {isQrMode && (
                    <svg className="w-2.5 h-2.5 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#333]">Es pago con QR</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          VISTA 2: PAGA CON PLIN (Centrado verticalmente - Capturas 3 y 4)
          ================================================== */}
      {currentView === "monto" && (
        <div className="min-h-screen flex flex-col justify-between bg-white px-4 pt-3.5 pb-6">
          {/* Top Bar: Volver y Destinatario */}
          <div className="flex-shrink-0">
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setCurrentView("search")}
                className="w-8 h-8 rounded-full bg-[#f2f4f7] flex items-center justify-center border-none cursor-pointer active:scale-90 transition mr-3"
              >
                <svg className="w-4 h-4 stroke-[#00B14F] stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="text-[16px] font-bold text-[#00B14F]">Paga con Plin</div>
            </div>

            {/* Tarjeta del Destinatario (Icono idéntico con trazo y sin relleno) */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center min-w-0 mr-2">
                <div className="w-[42px] h-[42px] rounded-full bg-[#52D285] flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 fill-[#065F29]" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-bold text-[#111] truncate">{recipientName}</div>
                  <div className="text-[12px] text-[#666]">
                    {isQrMode
                      ? destinoActual
                      : `${recipientPhone.slice(0, 3)} ${recipientPhone.slice(3, 6)} ${recipientPhone.slice(6)} · ${destinoActual}`}
                  </div>
                </div>
              </div>

              {/* Toggle Es pago con QR */}
              <div
                onClick={() => setIsQrMode(!isQrMode)}
                className="flex items-center gap-1.5 cursor-pointer select-none bg-[#f4fbf7] border border-[#d2f3e2] px-2.5 py-1.5 rounded-full active:scale-95 transition flex-shrink-0"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all ${
                    isQrMode ? "bg-[#00B14F] border-[#00B14F]" : "border-[#aaa] bg-white"
                  }`}
                >
                  {isQrMode && (
                    <svg className="w-2.5 h-2.5 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-[11.5px] font-bold text-[#005A28]">Pago con QR</span>
              </div>
            </div>
          </div>

          {/* CENTRO: Monto Grande S/ [monto] (Completamente centrado en el medio) */}
          <div
            onClick={() => amountInputRef.current?.focus()}
            className="flex-1 flex flex-col items-center justify-center my-auto cursor-text py-10"
          >
            <div className="flex items-baseline justify-center">
              <span className="text-[34px] font-black text-[#00B14F] mr-1.5 leading-none">s/</span>
              <span className={`text-[50px] font-black tracking-tight leading-none ${monto ? "text-[#00B14F]" : "text-[#111]"}`}>
                {monto || "0"}
              </span>
            </div>

            {/* Selector de Destino desplegable (ej. Plin ˅ o Yape ˅) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setModalDestinosOpen(true);
              }}
              className="flex items-center gap-1 mt-1 text-[13px] font-medium text-[#444] cursor-pointer active:scale-95 transition px-2 py-1"
            >
              <span>{destinoActual}</span>
              <svg className="w-3.5 h-3.5 stroke-[#444] stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Input real transparente para disparar teclado numérico nativo */}
            <input
              ref={amountInputRef}
              type="tel"
              inputMode="decimal"
              value={monto}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                if ((val.match(/\./g) || []).length <= 1) {
                  setMonto(val);
                }
              }}
              className="opacity-0 w-0 h-0 absolute pointer-events-none"
            />
          </div>

          {/* Sección Inferior: Mensaje, Saldo con cuenta_ahorro.png y Botón Plinear */}
          <div className="flex-shrink-0">
            {/* Campo de Mensaje Opcional */}
            <div className="mb-3.5">
              <input
                type="text"
                value={mensajeOpcional}
                onChange={(e) => setMensajeOpcional(e.target.value)}
                placeholder="Agrega un mensaje (opcional)"
                className="w-full border border-[#e5e7eb] rounded-[12px] p-3 text-[13.5px] text-[#333] outline-none focus:border-[#00B14F] placeholder-[#888] bg-transparent"
              />
            </div>

            {/* Fila de Saldo Disponible con cuenta_ahorro.png ahicado y fondo rosado */}
            <div
              onClick={() => setModalCuentasOpen(true)}
              className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#f9fafb] border border-[#f0f2f5] mb-4 cursor-pointer active:bg-gray-100 transition"
            >
              <div className="flex items-center min-w-0">
                {/* Contenedor circular con color de fondo rosado y cuenta_ahorro.png reducido */}
                <div className="w-[36px] h-[36px] rounded-full bg-[#FFD1DC] flex items-center justify-center mr-2.5 flex-shrink-0 overflow-hidden">
                  <img
                    src="/img/cuenta_ahorro.png"
                    alt="Cuenta"
                    className="w-[22px] h-[22px] object-contain pointer-events-none"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-[#666]">Saldo disponible ({currentSelectedAccount.name})</div>
                  <div className="text-[14px] font-extrabold text-[#111]">
                    {isBalanceHidden ? "S/ ••••••••" : `S/ ${formatBalance(currentSelectedAccount.bal)}`}
                  </div>
                </div>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBalanceHidden(!isBalanceHidden);
                }}
                className="w-[30px] h-[30px] rounded-full border border-[#0039A6] flex justify-center items-center cursor-pointer flex-shrink-0 active:scale-90 transition ml-2"
              >
                <svg className="w-3.5 h-3.5 stroke-[#0039A6] stroke-2 fill-none" viewBox="0 0 24 24">
                  {isBalanceHidden ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Botón Azul Plinear */}
            <button
              type="button"
              onClick={handlePlinear}
              disabled={!isMontoValido}
              className={`w-full py-3.5 rounded-full text-[15px] font-bold transition-all text-center border-none ${
                isMontoValido
                  ? "bg-[#0137AB] hover:bg-[#002D72] text-white cursor-pointer active:scale-[0.98]"
                  : "bg-[#0137AB]/50 text-white/80 cursor-not-allowed"
              }`}
            >
              Plinear
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          VISTA 3: COMPROBANTE - PLINEO EXITOSO (Captura exacta 10)
          ================================================== */}
      {currentView === "exito" && (
        <div ref={captureVoucherRef} className="min-h-screen flex flex-col bg-[#00B14F]">
          {/* Header verde con Insignia Plin geométrica erguida exacta (Captura 3 y 4) */}
          <div className="pt-8 pb-5 flex justify-center items-center relative flex-shrink-0">
            <div className="relative w-[82px] h-[88px] rounded-[24px] bg-[#96F3C0] flex items-center justify-center shadow-sm">
              <span className="absolute top-2 right-2 text-[#00702B] text-[11px] font-black select-none pointer-events-none">✦</span>
              <span className="absolute bottom-2 left-2 text-[#00702B] text-[10px] font-black select-none pointer-events-none">✦</span>
              <img
                src="/img/plin-voucher.webp"
                alt="Plin"
                className="w-[52px] h-[52px] object-contain pointer-events-none drop-shadow-sm"
              />
            </div>
          </div>

          {/* Contenedor blanco con bordes superiores redondeados (rounded-t-[28px]) */}
          <div className="flex-1 bg-white rounded-t-[28px] px-6 pt-7 pb-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="text-[17px] font-bold text-[#00B14F] mb-1.5">
                Plineo exitoso
              </div>

              <div className="text-[#00B14F] text-[34px] leading-tight mb-2.5 flex items-baseline gap-1">
                <span className="text-[26px] font-bold">s/</span>
                <span className="font-extrabold tracking-tight">{voucherData.montoFormatted}</span>
              </div>

              <div className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">
                a {recipientName}
              </div>

              <div className="text-[12px] text-[#71717A] mb-6">
                {voucherData.dateFormatted}
              </div>

              {/* Filas directas separadas por líneas sutiles */}
              <div className="divide-y divide-[#F2F2F2] border-t border-[#F2F2F2]">
                {/* Fila: Enviado a */}
                <div className="py-3.5 flex justify-between items-center text-[13px]">
                  <span className="text-[#71717A] font-normal">Enviado a</span>
                  <span className="text-[#1a1a1a] font-bold">
                    {voucherData.isQrMode
                      ? recipientName
                      : `${recipientPhone.slice(0, 3)} ${recipientPhone.slice(3, 6)} ${recipientPhone.slice(6)} – ${voucherData.destino || destinoActual}`}
                  </span>
                </div>

                {/* Fila: Cuenta de Cargo */}
                <div className="py-3.5 flex justify-between items-center text-[13px]">
                  <span className="text-[#71717A] font-normal">Cuenta de Cargo</span>
                  <span className="text-[#1a1a1a] font-bold">{voucherData.accountCargoName}</span>
                </div>

                {/* Fila: Código de operación (Sin función de copiar, puramente visual) */}
                <div className="py-3.5 flex justify-between items-center text-[13px]">
                  <span className="text-[#71717A] font-normal">Código de operación</span>
                  <div className="flex items-center gap-1.5 select-none pointer-events-none">
                    <span className="text-[#1a1a1a] font-bold">{voucherData.opCode}</span>
                    <svg className="w-3.5 h-3.5 stroke-[#1a1a1a] stroke-2 fill-none" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones Inferiores: Compartir y Volver a Plin */}
            <div className={`mt-8 flex-shrink-0 ${isCapturingVoucher ? "hidden pointer-events-none" : "block"}`}>
              <button
                type="button"
                id="actionButton"
                onClick={handleSharePlin}
                className="w-full py-3.5 rounded-full bg-[#0137AB] hover:bg-[#002D72] text-white text-[15px] font-bold flex items-center justify-center gap-2 mb-3 active:scale-[0.98] transition cursor-pointer border-none shadow-sm"
              >
                <span>Compartir</span>
                <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView("search");
                  setSearchQuery("");
                  setIsNineDigits(false);
                  setMonto("");
                  setIsQrMode(false);
                }}
                className="w-full py-3.5 rounded-full bg-white border-2 border-[#0137AB] text-[#0137AB] text-[15px] font-bold text-center active:scale-[0.98] transition cursor-pointer"
              >
                Volver a Plin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL BOTTOM SHEET: SELECCIONA EL DESTINO (Captura 2)
          ================================================== */}
      {modalDestinosOpen && (
        <div
          onClick={() => setModalDestinosOpen(false)}
          className="fixed inset-0 bg-black/60 z-[1000] flex items-end justify-center backdrop-blur-[1px] animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[480px] rounded-t-[24px] p-5 max-h-[75vh] flex flex-col animate-slideUp"
          >
            {/* Barra gris superior del modal */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <div className="text-[17px] font-bold text-[#111] mb-3">
              Selecciona el destino
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#f2f4f7] no-scrollbar">
              {DESTINOS.map((banco) => (
                <div
                  key={banco}
                  onClick={() => {
                    setDestinoActual(banco);
                    setModalDestinosOpen(false);
                  }}
                  className="py-3.5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Icono de Billetera Verde (Captura 2) */}
                    <div className="w-7 h-7 rounded-[7px] bg-[#00B14F] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                      </svg>
                    </div>
                    <span className="text-[14px] font-semibold text-[#222]">{banco}</span>
                  </div>

                  <svg className="w-4 h-4 stroke-[#444] stroke-[2.5] fill-none" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL BOTTOM SHEET: SELECCIONA LA CUENTA DE CARGO
          ================================================== */}
      {modalCuentasOpen && (
        <div
          onClick={() => setModalCuentasOpen(false)}
          className="fixed inset-0 bg-black/60 z-[1000] flex items-end justify-center backdrop-blur-[1px] animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[480px] rounded-t-[24px] p-5 max-h-[75vh] flex flex-col animate-slideUp"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <div className="text-[17px] font-bold text-[#111] mb-3">
              Selecciona la cuenta de cargo
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#f2f4f7] no-scrollbar">
              {accounts.map((acc, idx) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccIndex(idx);
                    setModalCuentasOpen(false);
                  }}
                  className="py-3.5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition"
                >
                  <div>
                    <div className="text-[14px] font-bold text-[#111]">{acc.name}</div>
                    <div className="text-[12px] text-[#666]">
                      Saldo: {acc.curr} {formatBalance(acc.bal)}
                    </div>
                  </div>

                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${selectedAccIndex === idx ? "border-[#00B14F]" : "border-[#ccc]"}`}>
                    {selectedAccIndex === idx && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00B14F]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

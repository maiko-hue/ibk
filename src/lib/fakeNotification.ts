"use client";

export interface FakeNotiConfig {
  randomDataEnabled: boolean;
  darkModeEnabled: boolean;
  customSenders: string[];
  amountType: "range" | "fixed";
  amountMin: number;
  amountMax: number;
  fixedAmount: number;
}

export const DEFAULT_RANDOM_NAMES: string[] = [
  "Hernan Torres Vargas",
  "Maikol Torres Vargas",
  "Alejandro Flores Perez",
  "Andrea Torres Gomez",
  "Carlos Mendoza Ruiz",
  "Daniela Castro Ortiz",
  "Diego Franco Rios",
  "Alonso Mendoza Vega",
  "Adriana Rojas Paredes",
  "Cesar Morales Soto",
];

export const DEFAULT_NOTI_CONFIG: FakeNotiConfig = {
  randomDataEnabled: true,
  darkModeEnabled: false,
  customSenders: [],
  amountType: "range",
  amountMin: 10,
  amountMax: 500,
  fixedAmount: 25,
};

export const NOTI_CONFIG_STORAGE_KEY = "ibk_fake_noti_config";
export const NOTI_TRIGGER_EVENT = "ibk_trigger_fake_push";
export const BALANCE_UPDATED_EVENT = "ibk_balance_updated";

export function getFakeNotiConfig(): FakeNotiConfig {
  if (typeof window === "undefined") return DEFAULT_NOTI_CONFIG;
  try {
    const raw = localStorage.getItem(NOTI_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTI_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      randomDataEnabled: parsed.randomDataEnabled ?? DEFAULT_NOTI_CONFIG.randomDataEnabled,
      darkModeEnabled: parsed.darkModeEnabled ?? DEFAULT_NOTI_CONFIG.darkModeEnabled,
      customSenders: Array.isArray(parsed.customSenders)
        ? parsed.customSenders
            .filter((s: string) => typeof s === "string" && s.trim().length > 0 && s !== "Hernan Torres Vargas" && s !== "Maikol Torres Vargas")
            .slice(0, 10)
        : [],
      amountType: parsed.amountType === "fixed" ? "fixed" : "range",
      amountMin: typeof parsed.amountMin === "number" ? Math.max(1, parsed.amountMin) : 10,
      amountMax: typeof parsed.amountMax === "number" ? Math.max(1, parsed.amountMax) : 500,
      fixedAmount: typeof parsed.fixedAmount === "number" ? Math.max(1, parsed.fixedAmount) : 25,
    };
  } catch (_) {
    return DEFAULT_NOTI_CONFIG;
  }
}

export function saveFakeNotiConfig(config: FakeNotiConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}
}

export function generateFakePushPayload(config: FakeNotiConfig): {
  senderName: string;
  amount: number;
  formattedAmount: string;
  isDarkMode: boolean;
} {
  let senderName = "Hernan Torres Vargas";
  let amount = 15;

  if (config.randomDataEnabled) {
    // 1. Nombre aleatorio de la lista de 10
    const randomIdx = Math.floor(Math.random() * DEFAULT_RANDOM_NAMES.length);
    senderName = DEFAULT_RANDOM_NAMES[randomIdx];

    // 2. Monto aleatorio entre 10 y 500
    const min = 10;
    const max = 500;
    // Generar monto con decimales creíbles (.00 o .50)
    const intPart = Math.floor(Math.random() * (max - min + 1)) + min;
    const cents = Math.random() < 0.4 ? 0 : Math.random() < 0.7 ? 0.5 : 0;
    amount = intPart + cents;
  } else {
    // 1. Remitente personalizado
    const senders = config.customSenders.length > 0 ? config.customSenders : DEFAULT_RANDOM_NAMES;
    const randomIdx = Math.floor(Math.random() * senders.length);
    senderName = senders[randomIdx];

    // 2. Monto personalizado según modo
    if (config.amountType === "fixed") {
      amount = config.fixedAmount > 0 ? config.fixedAmount : 15;
    } else {
      const min = Math.min(config.amountMin, config.amountMax);
      const max = Math.max(config.amountMin, config.amountMax);
      const intPart = Math.floor(Math.random() * (max - min + 1)) + min;
      const cents = Math.random() < 0.4 ? 0 : Math.random() < 0.7 ? 0.5 : 0;
      amount = intPart + cents;
    }
  }

  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    senderName,
    amount,
    formattedAmount,
    isDarkMode: config.darkModeEnabled,
  };
}

export function executeFakePlinDeposit(): {
  senderName: string;
  amount: number;
  formattedAmount: string;
  newBalance: string;
  isDarkMode: boolean;
} {
  const config = getFakeNotiConfig();
  const payload = generateFakePushPayload(config);

  if (typeof window !== "undefined") {
    // 1. Sumar a Cuenta Simple Soles (ibk_acc1_bal)
    const currentBalRaw = localStorage.getItem("ibk_acc1_bal") || "1000.00";
    const currentBal = parseFloat(currentBalRaw.replace(/,/g, "")) || 0;
    const updatedBal = currentBal + payload.amount;
    const formattedNewBal = updatedBal.toFixed(2);
    localStorage.setItem("ibk_acc1_bal", formattedNewBal);

    // 2. Registrar en movimientos entrantes (ibk_movimientos)
    try {
      const rawMovs = localStorage.getItem("ibk_movimientos") || "[]";
      const movs = JSON.parse(rawMovs);
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " - " + now.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const newMov = {
        id: Date.now().toString(),
        title: payload.senderName,
        senderName: payload.senderName,
        subtitle: "Plineo recibido",
        amount: `+${payload.formattedAmount}`,
        currency: "S/",
        date: dateStr,
        opCode: String(Math.floor(10000000 + Math.random() * 90000000)),
        accountId: "1",
        accountName: localStorage.getItem("ibk_acc1_name") || "Cuenta Simple Soles",
        tipo: "Pago a contactos",
        operationType: "Pago a contactos",
        isFakeNoti: true,
        phone: "9" + Math.floor(10000000 + Math.random() * 90000000),
      };

      movs.unshift(newMov);
      localStorage.setItem("ibk_movimientos", JSON.stringify(movs));
    } catch (errMov) {
      console.warn("Error guardando movimiento entrante:", errMov);
    }

    // 3. Reproducir audio noti.mp3
    try {
      const audio = new Audio("/noti.mp3");
      audio.play().catch((_) => {});
    } catch (_) {}

    // 4. Disparar eventos de sincronización en la ventana
    try {
      window.dispatchEvent(
        new CustomEvent(BALANCE_UPDATED_EVENT, {
          detail: { newBalance: formattedNewBal },
        })
      );
      window.dispatchEvent(
        new CustomEvent(NOTI_TRIGGER_EVENT, {
          detail: payload,
        })
      );
    } catch (_) {}

    return {
      ...payload,
      newBalance: formattedNewBal,
    };
  }

  return {
    ...payload,
    newBalance: "1000.00",
  };
}

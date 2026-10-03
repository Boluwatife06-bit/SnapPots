import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "NGN" | "USD";

// Static display rate used only for the quick USD preview toggle.
const USD_PER_NGN = 1 / 1550;

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  toggle: () => void;
  format: (ngnAmount: number) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");

  useEffect(() => {
    const stored = window.localStorage.getItem("snappots:currency");
    if (stored === "USD" || stored === "NGN") setCurrency(stored);
  }, []);

  const value = useMemo<Ctx>(() => {
    const set = (c: CurrencyCode) => {
      setCurrency(c);
      window.localStorage.setItem("snappots:currency", c);
    };
    return {
      currency,
      setCurrency: set,
      toggle: () => set(currency === "NGN" ? "USD" : "NGN"),
      format: (ngnAmount: number) =>
        currency === "NGN"
          ? formatNGN(ngnAmount)
          : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
              ngnAmount * USD_PER_NGN,
            ),
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}

export function formatNGN(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

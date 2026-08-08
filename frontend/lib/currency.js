// All prices in the database are stored in PHP. These are simple fixed
// conversion rates for demo purposes (not live exchange rates) - good
// enough to make the currency switcher actually change displayed prices,
// not just be a cosmetic dropdown.
export const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso", symbol: "₱", rate: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 0.0175 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.0161 },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.0138 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 2.58 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 23.9 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 0.0236 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 0.0268 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 0.127 },
];

export function convertFromPhp(phpAmount, currency) {
  return phpAmount * currency.rate;
}

export function formatPrice(phpAmount, currency) {
  const converted = convertFromPhp(Number(phpAmount), currency);
  const decimals = currency.code === "JPY" || currency.code === "KRW" ? 0 : 2;
  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export const LANGUAGES = [
  "English",
  "Filipino",
  "中文 (Chinese)",
  "日本語 (Japanese)",
  "한국어 (Korean)",
];

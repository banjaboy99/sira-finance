// Supported currencies with symbols and names
export const CURRENCIES = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', code: 'GHS' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', code: 'KES' },
  ZAR: { symbol: 'R', name: 'South African Rand', code: 'ZAR' },
  XOF: { symbol: 'CFA', name: 'West African CFA Franc', code: 'XOF' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const getCurrencySymbol = (code: CurrencyCode): string => {
  return CURRENCIES[code]?.symbol || code;
};

export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = 'NGN',
  options?: { showSymbol?: boolean; decimals?: number }
): string => {
  const { showSymbol = true, decimals = 2 } = options || {};
  const currency = CURRENCIES[currencyCode];
  
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (showSymbol && currency) {
    return `${currency.symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
};

export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<string, number>
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first (base currency), then to target
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // amount in USD = amount / fromRate
  // amount in toCurrency = (amount / fromRate) * toRate
  return (amount / fromRate) * toRate;
};

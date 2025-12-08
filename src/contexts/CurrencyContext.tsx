import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CurrencyCode, CURRENCIES, formatCurrency, convertCurrency } from '@/lib/currencies';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  rates: ExchangeRates;
  lastUpdated: Date | null;
  isLoading: boolean;
  setBaseCurrency: (currency: CurrencyCode) => void;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  format: (amount: number, fromCurrency?: CurrencyCode) => string;
  convert: (amount: number, fromCurrency: CurrencyCode, toCurrency?: CurrencyCode) => number;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES_CACHE_KEY = 'sira_exchange_rates';
const RATES_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in ms

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [baseCurrency, setBaseCurrencyState] = useState<CurrencyCode>('NGN');
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>('NGN');
  const [rates, setRates] = useState<ExchangeRates>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cached rates on mount
  useEffect(() => {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      try {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < RATES_CACHE_EXPIRY) {
          setRates(cachedRates);
          setLastUpdated(new Date(timestamp));
        }
      } catch (e) {
        console.error('Failed to parse cached rates:', e);
      }
    }
  }, []);

  // Load user's currency preference from profile
  useEffect(() => {
    const loadUserCurrency = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single();
      
      if (profile?.currency && profile.currency in CURRENCIES) {
        setBaseCurrencyState(profile.currency as CurrencyCode);
        setDisplayCurrencyState(profile.currency as CurrencyCode);
      }
    };
    
    loadUserCurrency();
  }, [user?.id]);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using exchangerate-api.com free tier (no API key required)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      const newRates = data.rates as ExchangeRates;
      
      setRates(newRates);
      setLastUpdated(new Date());
      
      // Cache the rates
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
        rates: newRates,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Keep existing rates if fetch fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch rates on mount and when cache expires
  useEffect(() => {
    const shouldFetch = !lastUpdated || (Date.now() - lastUpdated.getTime()) > RATES_CACHE_EXPIRY;
    if (shouldFetch) {
      fetchRates();
    }
  }, [fetchRates, lastUpdated]);

  const setBaseCurrency = useCallback(async (currency: CurrencyCode) => {
    setBaseCurrencyState(currency);
    
    // Update profile if user is logged in
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ currency })
        .eq('id', user.id);
    }
  }, [user?.id]);

  const setDisplayCurrency = useCallback((currency: CurrencyCode) => {
    setDisplayCurrencyState(currency);
    localStorage.setItem('sira_display_currency', currency);
  }, []);

  // Load display currency preference
  useEffect(() => {
    const savedDisplay = localStorage.getItem('sira_display_currency');
    if (savedDisplay && savedDisplay in CURRENCIES) {
      setDisplayCurrencyState(savedDisplay as CurrencyCode);
    }
  }, []);

  const format = useCallback((amount: number, fromCurrency?: CurrencyCode) => {
    const sourceCurrency = fromCurrency || baseCurrency;
    
    if (sourceCurrency === displayCurrency || Object.keys(rates).length === 0) {
      return formatCurrency(amount, sourceCurrency);
    }
    
    const convertedAmount = convertCurrency(amount, sourceCurrency, displayCurrency, rates);
    return formatCurrency(convertedAmount, displayCurrency);
  }, [baseCurrency, displayCurrency, rates]);

  const convert = useCallback((amount: number, fromCurrency: CurrencyCode, toCurrency?: CurrencyCode) => {
    const targetCurrency = toCurrency || displayCurrency;
    return convertCurrency(amount, fromCurrency, targetCurrency, rates);
  }, [displayCurrency, rates]);

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        displayCurrency,
        rates,
        lastUpdated,
        isLoading,
        setBaseCurrency,
        setDisplayCurrency,
        format,
        convert,
        refreshRates: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

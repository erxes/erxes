import { useRef, useState } from 'react';

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export const usePricing = (
  initialPrice?: number,
  initialPercent?: number,
  initialTotal?: number,
) => {
  const [price, setPrice] = useState(initialPrice != null ? String(initialPrice) : '');
  const [percent, setPercent] = useState(initialPercent != null ? String(initialPercent) : '');
  const [displayTotal, setDisplayTotal] = useState<number | null>(initialTotal ?? null);

  const totalRef = useRef<number | null>(initialTotal ?? null);
  const percentRef = useRef(percent);
  const confirmedInitialTotal = useRef<number | null>(initialTotal ?? null);

  const syncPercent = (value: string) => {
    percentRef.current = value;
    setPercent(value);
  };

  const applyTotal = (total: number) => {
    const pct = parseFloat(percentRef.current);
    if (!percentRef.current || Number.isNaN(pct)) {
      setPrice(total ? String(total) : '');
    } else {
      setPrice(total ? String(+(total * (1 - pct / 100)).toFixed(2)) : '');
    }
  };

  const onTotalChange = (total: number) => {
    const prev = totalRef.current;
    totalRef.current = total;
    setDisplayTotal(total || null);

    if (total === confirmedInitialTotal.current && total === prev) {
      return;
    }

    confirmedInitialTotal.current = null;
    applyTotal(total);
  };

  const onPriceChange = (value: number) => {
    setPrice(value ? String(value) : '');
    const total = totalRef.current;
    if (total && value > 0 && value < total) {
      syncPercent(String(+((1 - value / total) * 100).toFixed(2)));
    } else {
      syncPercent('');
    }
  };

  const onPercentChange = (value: string) => {
    syncPercent(value);
    const pct = parseFloat(value);
    const total = totalRef.current;
    if (total && !Number.isNaN(pct) && pct >= 0 && pct <= 100) {
      setPrice(String(+(total * (1 - pct / 100)).toFixed(2)));
    }
  };

  const reset = (p?: number, pct?: number, total?: number) => {
    setPrice(p != null ? String(p) : '');
    syncPercent(pct != null ? String(pct) : '');
    totalRef.current = total ?? null;
    setDisplayTotal(total ?? null);
    confirmedInitialTotal.current = total ?? null;
  };

  const showTotal = displayTotal != null && price !== '' && Number(price) !== displayTotal;

  return {
    price,
    percent,
    displayTotal: showTotal ? fmt(displayTotal) : null,
    onTotalChange,
    onPriceChange,
    onPercentChange,
    reset,
  };
};

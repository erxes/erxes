import { describe, expect, it } from 'vite-plus/test';
import { amountStep, formatMoney, fromAmountInput, toAmountInput } from '../money';

/** Intl puts a no-break space between a currency code and the number. */
const read = (amount: number, currency: string) =>
  formatMoney(amount, currency, 'en').replaceAll(' ', ' ');

describe('money', () => {
  it('reads amounts in each currency’s smallest unit', () => {
    expect(read(1250, 'USD')).toBe('$12.50');
    expect(read(500, 'JPY')).toBe('¥500');
    expect(read(1500, 'KWD')).toBe('KWD 1.500');
    expect(read(150_000, 'MNT')).toBe('MNT 1,500.00');
  });

  it('turns what is typed into the smallest unit and back', () => {
    expect(fromAmountInput('12.5', 'USD')).toBe(1250);
    expect(fromAmountInput('500', 'JPY')).toBe(500);
    expect(fromAmountInput('1.234', 'KWD')).toBe(1234);
    expect(toAmountInput(150_000, 'MNT')).toBe('1500.00');
    expect(toAmountInput(1250, 'USD')).toBe('12.50');
    expect(toAmountInput(1234, 'KWD')).toBe('1.234');
    expect(toAmountInput(500, 'JPY')).toBe('500');
    expect(amountStep('JPY')).toBe(1);
    expect(amountStep('USD')).toBe(0.01);
  });
});

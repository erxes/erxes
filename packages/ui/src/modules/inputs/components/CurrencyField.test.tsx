// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import type { CurrencyCode } from '../../../constants/currencyCode';
import { CurrencyField } from './CurrencyField';

const render = setupDomRender();

const rows = () => [...document.querySelectorAll('[cmdk-item]')].map((item) => item.textContent);

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      }),
  );

describe('CurrencyField.SelectCurrencyCommand', () => {
  it('lists the currencies it is given, the picked one first', () => {
    render(
      <CurrencyField.SelectCurrencyCommand
        currencies={['USD', 'MNT', 'EUR']}
        value="MNT"
        onSelect={() => undefined}
      />,
    );

    expect(rows()).toEqual(['Mongolian tögrög', 'United States dollar', 'Euro']);
  });

  it('lists every currency without a list', () => {
    render(<CurrencyField.SelectCurrencyCommand onSelect={() => undefined} />);

    expect(rows()).toContain('Mongolian tögrög');
    expect(rows().length).toBeGreaterThan(150);
  });

  it('reports the code of the currency picked', () => {
    const onSelect = vi.fn<(code: CurrencyCode) => void>();

    render(<CurrencyField.SelectCurrencyCommand currencies={['USD', 'EUR']} onSelect={onSelect} />);

    act(() => {
      [...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
        .find((item) => item.textContent === 'Euro')
        ?.click();
    });

    expect(onSelect).toHaveBeenCalledWith('EUR');
  });
});

describe('CurrencyField.SelectCurrency', () => {
  it('shows the picked currency, and the prompt without one', () => {
    const picked = render(<CurrencyField.SelectCurrency value="USD" />);

    expect(picked.textContent).toContain('United States dollar');

    const empty = render(<CurrencyField.SelectCurrency />);

    expect(empty.textContent).toContain('Select currency');
  });

  it('picks from the organisation’s currencies and closes', async () => {
    const onChange = vi.fn<(code: CurrencyCode) => void>();

    const container = render(
      <CurrencyField.SelectCurrency currencies={['MNT', 'USD']} onChange={onChange} />,
    );

    act(() => container.querySelector('button')?.click());
    await settle();

    expect(rows()).toEqual(['Mongolian tögrög', 'United States dollar']);

    act(() => {
      [...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
        .find((item) => item.textContent === 'Mongolian tögrög')
        ?.click();
    });
    await settle();

    expect(onChange).toHaveBeenCalledWith('MNT');
    expect(rows()).toEqual([]);
  });
});

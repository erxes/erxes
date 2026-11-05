import { act, renderHook } from '@testing-library/react';
import { useBroadcastFromAddress } from '../useBroadcastFromAddress';

const renderAddress = (value: string, domains = ['bank.mn', 'bankcard.mn']) => {
  const onChange = jest.fn();
  const { result } = renderHook(() =>
    useBroadcastFromAddress({ value, onChange, domains }),
  );

  return { result, onChange };
};

describe('useBroadcastFromAddress', () => {
  it('writes the local part on the first verified domain', () => {
    const { result, onChange } = renderAddress('');

    expect(result.current.domain).toBe('bank.mn');

    act(() => result.current.changeLocal('news'));

    expect(onChange).toHaveBeenLastCalledWith('news@bank.mn');
  });

  it('keeps a pasted address on its own verified domain', () => {
    const { result, onChange } = renderAddress('');

    act(() => result.current.changeLocal('promo@BankCard.mn'));

    expect(onChange).toHaveBeenLastCalledWith('promo@bankcard.mn');
  });

  it('clears the From when the local part is emptied', () => {
    const { result, onChange } = renderAddress('news@bank.mn');

    act(() => result.current.changeLocal(''));

    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('moves the address to another verified domain', () => {
    const { result, onChange } = renderAddress('news@bank.mn');

    act(() => result.current.changeDomain('bankcard.mn'));

    expect(onChange).toHaveBeenLastCalledWith('news@bankcard.mn');
  });

  it('keeps a saved From on an unverified domain in sight', () => {
    const { result } = renderAddress('agency@studio.mn');

    expect(result.current.options).toEqual([
      'bank.mn',
      'bankcard.mn',
      'studio.mn',
    ]);
    expect(result.current.verified).toBe(false);
  });
});

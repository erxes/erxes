import { act, renderHook } from '@testing-library/react';
import { useSafeRemainderImport } from '@/inventories/safeRemainders/hooks/useSafeRemainderImport';

jest.mock('csv-parse/browser/esm/sync', () =>
  jest.requireActual('csv-parse/sync'),
);
jest.mock('react-i18next', () => ({
  getI18n: () => undefined,
  useTranslation: () => ({ t: (key: string) => key }),
}));

const csv = 'Code,Unit Price,count,isSale,totalCost\n001,150,2,true,100';
const fileWithText = (name: string, text: () => Promise<string>): File =>
  Object.assign(new File([], name), { text });

describe('useSafeRemainderImport', () => {
  it('loads CSV once and derives validated items from the current mapping', async () => {
    const { result } = renderHook(() => useSafeRemainderImport(false));
    const text = jest.fn().mockResolvedValue(csv);
    await act(async () => {
      await result.current.readFile(fileWithText('count.csv', text));
    });
    expect(result.current.items[0].trInfo?.unitPrice).toBe(150);
    act(() => result.current.selectColumn(1, ''));
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toContain('unitPrice');
    act(() => result.current.resetMapping());
    expect(result.current.items).toHaveLength(1);
    expect(text).toHaveBeenCalledTimes(1);
  });

  it('discards a pending CSV read after switching to TXT', async () => {
    const { result } = renderHook(() => useSafeRemainderImport(false));
    let finish: (text: string) => void = () => undefined;
    const pendingText = new Promise<string>((resolve) => {
      finish = resolve;
    });
    act(() => {
      void result.current.readFile(fileWithText('slow.csv', () => pendingText));
    });
    act(() => result.current.changeFormat('txt'));
    await act(async () => {
      finish(csv);
    });
    expect(result.current.preview).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.fileName).toBe('');
    await act(async () => {
      await result.current.readFile(
        fileWithText('count.txt', async () => '001,3'),
      );
    });
    expect(result.current.items).toEqual([{ productCode: '001', count: 3 }]);
  });

  it('keeps the newest upload when an older read finishes later', async () => {
    const { result } = renderHook(() => useSafeRemainderImport(false));
    let finish: (text: string) => void = () => undefined;
    const pendingText = new Promise<string>((resolve) => {
      finish = resolve;
    });
    act(() => {
      void result.current.readFile(fileWithText('slow.csv', () => pendingText));
    });
    await act(async () => {
      await result.current.readFile(fileWithText('new.csv', async () => csv));
    });
    await act(async () => {
      finish('Code,count,isSale\nOLD,1,false');
    });
    expect(result.current.fileName).toBe('new.csv');
    expect(result.current.items[0].productCode).toBe('001');
  });

  it('clears imported rows on a failed replacement and on close', async () => {
    const { result } = renderHook(() => useSafeRemainderImport(false));
    await act(async () => {
      await result.current.readFile(fileWithText('count.csv', async () => csv));
    });
    await act(async () => {
      await result.current.readFile(
        fileWithText('invalid.csv', async () => {
          throw new Error('read failed');
        }),
      );
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('read failed');
    act(() => result.current.clear());
    expect(result.current.fileName).toBe('');
    expect(result.current.error).toBe('');
  });

  it('does not replace the import while a mutation is saving', async () => {
    const { result, rerender } = renderHook(
      ({ disabled }) => useSafeRemainderImport(disabled),
      { initialProps: { disabled: false } },
    );
    await act(async () => {
      await result.current.readFile(fileWithText('count.csv', async () => csv));
    });
    rerender({ disabled: true });
    await act(async () => {
      await result.current.readFile(fileWithText('other.csv', async () => ''));
    });
    act(() => {
      result.current.changeFormat('txt');
      result.current.selectColumn(0, '');
    });
    expect(result.current.format).toBe('csv');
    expect(result.current.fileName).toBe('count.csv');
    expect(result.current.items).toHaveLength(1);
  });
});

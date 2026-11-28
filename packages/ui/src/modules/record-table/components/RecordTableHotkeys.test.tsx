// @vitest-environment happy-dom
import { Provider as JotaiProvider, createStore } from 'jotai';
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { RecordTableHotKeyControl, RecordTableHotkeyProvider } from './RecordTableHotkeys';

const render = setupDomRender();

const SCOPE = 'transaction-form';

const Grid = ({ press }: { press: (cell: string) => void }) => (
  <RecordTableHotkeyProvider columnLength={2} rowLength={2} scope={SCOPE}>
    <table>
      <tbody>
        {['r0', 'r1'].map((rowId, rowIndex) => (
          <tr key={rowId}>
            {['a', 'b'].map((column) => (
              <RecordTableHotKeyControl key={column} rowId={rowId} rowIndex={rowIndex}>
                <td>
                  <button type="button" onClick={() => press(`${rowId}${column}`)}>
                    {`${rowId}${column}`}
                  </button>
                </td>
              </RecordTableHotKeyControl>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </RecordTableHotkeyProvider>
);

const key = (name: string) =>
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: name, code: name, bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: name, code: name, bubbles: true }));
  });

const clickCell = (text: string) =>
  act(() => {
    [...document.querySelectorAll('td')].find((td) => td.textContent === text)?.click();
  });

describe('RecordTableHotkeyProvider', () => {
  it('moves through the cells with the arrow keys and presses the active one on Enter', () => {
    const press = vi.fn<(cell: string) => void>();

    render(
      <JotaiProvider store={createStore()}>
        <Grid press={press} />
      </JotaiProvider>,
    );

    clickCell('r0a');
    press.mockClear();

    key('ArrowRight');
    key('Enter');
    expect(press).toHaveBeenLastCalledWith('r0b');

    // Past a row's last cell, the next row's first.
    key('ArrowRight');
    key('Enter');
    expect(press).toHaveBeenLastCalledWith('r1a');

    key('ArrowUp');
    key('Enter');
    expect(press).toHaveBeenLastCalledWith('r0a');

    // Nothing above the first row: the cell stays active.
    press.mockClear();
    key('ArrowUp');
    key('Enter');
    expect(press.mock.calls).toEqual([['r0a']]);
  });
});

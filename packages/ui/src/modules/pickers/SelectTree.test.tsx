// @vitest-environment happy-dom
import { Provider as JotaiProvider, createStore } from 'jotai';
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { Command } from '../../components/command';
import { setupDomRender } from '../../lib/render-in-dom';
import { SelectTree } from './SelectTree';

const render = setupDomRender();

const UNITS = [
  { id: 'hq', name: 'Head office', order: 'hq/', hasChildren: true },
  { id: 'ub', name: 'Ulaanbaatar', order: 'hq/ub/', hasChildren: true },
  { id: 'ub1', name: 'UB store 1', order: 'hq/ub/ub1/', hasChildren: false },
  { id: 'dk', name: 'Darkhan', order: 'hq/dk/', hasChildren: false },
];

const Picker = ({
  store,
  ordered = true,
  selected,
  onPick = () => undefined,
}: {
  /** Each test's own, so no fold carries over. */
  store: ReturnType<typeof createStore>;
  ordered?: boolean;
  selected?: string;
  onPick?: (id: string) => void;
}) => (
  <JotaiProvider store={store}>
    <Command>
      <Command.List>
        <SelectTree.Provider id="units" ordered={ordered}>
          {UNITS.map((unit) => (
            <SelectTree.Item
              key={unit.id}
              value={unit.id}
              name={unit.name}
              order={unit.order}
              hasChildren={unit.hasChildren}
              selected={selected === unit.id}
              onSelect={() => onPick(unit.id)}
            >
              {unit.name}
            </SelectTree.Item>
          ))}
        </SelectTree.Provider>
      </Command.List>
    </Command>
  </JotaiProvider>
);

const items = () => [...document.querySelectorAll('[cmdk-item]')].map((item) => item.textContent);

const fold = (name: string) =>
  act(() => {
    const item = [...document.querySelectorAll('[cmdk-item]')].find(
      (row) => row.textContent === name,
    );

    item?.parentElement?.querySelector<HTMLElement>('[role="button"]')?.click();
  });

describe('SelectTree', () => {
  it('folds an item’s children under it, and opens them again', () => {
    render(<Picker store={createStore()} />);

    fold('Ulaanbaatar');
    expect(items()).toEqual(['Head office', 'Ulaanbaatar', 'Darkhan']);

    fold('Head office');
    expect(items()).toEqual(['Head office']);

    fold('Head office');
    expect(items()).toEqual(['Head office', 'Ulaanbaatar', 'Darkhan']);
  });

  it('lists a search result flat, with no arrows to fold', () => {
    render(<Picker store={createStore()} ordered={false} />);

    expect(items()).toEqual(['Head office', 'Ulaanbaatar', 'UB store 1', 'Darkhan']);
    expect(document.querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('picks an item and marks the picked one', () => {
    const onPick = vi.fn<(id: string) => void>();

    render(<Picker store={createStore()} selected="dk" onPick={onPick} />);

    act(() => {
      [...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
        .find((item) => item.textContent === 'UB store 1')
        ?.click();
    });

    expect(onPick).toHaveBeenCalledWith('ub1');
    expect(document.querySelector('[aria-current="true"]')?.textContent).toBe('Darkhan');
  });
});

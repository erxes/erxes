// @vitest-environment happy-dom
import * as coreDnd from '@dnd-kit/core';
import * as coreSortable from '@dnd-kit/sortable';
import { describe, expect, it } from 'vite-plus/test';
import { loadAgain } from '../../../../tools/test/load-again';
import { setupDomRender } from '../lib/render-in-dom';
import { Board } from '../modules/board/Board';
import { useSortList } from './use-sort-accessibility';

type Dnd = { core: typeof coreDnd; sortable: typeof coreSortable };

/** Whether a module has every export `like` has. */
const hasExportsOf = <T extends object>(like: T, module: unknown): module is T =>
  typeof module === 'object' && module !== null && Object.keys(like).every((key) => key in module);

/**
 * A second copy of dnd-kit, as a plugin bundles: dnd-kit isn't shared, so each plugin has its
 * own, whose id counter starts again at 0.
 */
const loadPluginCopy = (): Dnd => {
  const [core, sortable] = loadAgain(import.meta.url, '/@dnd-kit/', [
    '@dnd-kit/core',
    '@dnd-kit/sortable',
  ]);

  if (!hasExportsOf(coreDnd, core) || !hasExportsOf(coreSortable, sortable)) {
    throw new Error('dnd-kit did not load again');
  }

  return { core, sortable };
};

/** A sortable list of tabs or cards, built from one copy of dnd-kit with erxes-ui's hook. */
const sortableList = ({ core, sortable }: Dnd) => {
  const Item = ({ id }: { id: string }) => {
    const { attributes, listeners, setNodeRef } = sortable.useSortable({ id });

    return (
      <button type="button" ref={setNodeRef} {...attributes} {...listeners}>
        {id}
      </button>
    );
  };

  return ({ items, pointer = false }: { items: string[]; pointer?: boolean }) => (
    <core.DndContext {...useSortList(String, { pointer })}>
      <sortable.SortableContext items={items}>
        {items.map((id) => (
          <Item key={id} id={id} />
        ))}
      </sortable.SortableContext>
    </core.DndContext>
  );
};

// Core's tab bar, on web's dnd-kit, and a plugin's list on its own copy.
const CoreTabs = sortableList({ core: coreDnd, sortable: coreSortable });
const PluginList = sortableList(loadPluginCopy());

const render = setupDomRender();

const POINTER = 'Drag the item with the mouse, or touch and hold it, to move it.';
const KEYS = 'Press Space to pick up the item';

/** The id of an item's instructions, and the text a screen reader reads from it. */
const described = (item: Element | null | undefined) => {
  const id = item?.getAttribute('aria-describedby') ?? '';

  return { id, text: document.getElementById(id)?.textContent };
};

const button = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll('button')).find((node) => node.textContent === name);

describe('useSortList', () => {
  it("gives a plugin's list instructions of its own beside core's tab bar", () => {
    const page = render(
      <>
        <CoreTabs items={['Contacts', 'Inbox']} pointer />
        <PluginList items={['Deal 1', 'Deal 2']} />
      </>,
    );

    const tab = described(button(page, 'Contacts'));
    const card = described(button(page, 'Deal 1'));

    expect(card.id).not.toBe(tab.id);
    expect(tab.text).toBe(POINTER);
    expect(card.text).toContain(KEYS);
    expect(described(button(page, 'Deal 2'))).toEqual(card);
  });

  it("gives a plugin's list instructions of its own beside erxes-ui's board", () => {
    const page = render(
      <>
        <Board onMove={() => undefined}>
          <Board.Column id="new" title="New" count={1} empty="No leads">
            <Board.Card id="lead" title="Lead" onOpen={() => undefined}>
              Lead
            </Board.Card>
          </Board.Column>
        </Board>
        <PluginList items={['Tab 1']} pointer />
      </>,
    );

    const card = described(page.querySelector('[aria-roledescription="movable card"]'));
    const tab = described(button(page, 'Tab 1'));

    expect(card.id).not.toBe(tab.id);
    expect(card.text).toContain('Press Enter to open the card.');
    expect(tab.text).toBe(POINTER);
  });
});

import { act, renderHook } from '@testing-library/react';
import { IFile, IFilesFolder } from 'ui-modules';
import { TFilesItem, useFilesSelection } from '../useFilesSelection';

const folder = (id: string): TFilesItem => ({
  itemType: 'folder',
  item: { _id: id, name: id } as IFilesFolder,
});
const file = (id: string): TFilesItem => ({
  itemType: 'file',
  item: {
    _id: id,
    name: id,
    mimeType: 'text/plain',
    size: 1,
    status: 'ready',
  } as IFile,
});

const visible = [folder('a'), folder('b'), file('c'), file('d'), file('e')];

const setup = (resetKey = 'root') =>
  renderHook(({ items, key }) => useFilesSelection(items, key), {
    initialProps: { items: visible, key: resetKey },
  });

describe('useFilesSelection', () => {
  it('toggles single items and splits ids by type', () => {
    const { result } = setup();

    act(() => result.current.select(folder('a')));
    act(() => result.current.select(file('d')));

    expect(result.current.count).toBe(2);
    expect(result.current.folderIds).toEqual(['a']);
    expect(result.current.fileIds).toEqual(['d']);

    act(() => result.current.select(folder('a')));

    expect(result.current.folderIds).toEqual([]);
  });

  it('selects the on-screen range from the last clicked item with Shift', () => {
    const { result } = setup();

    act(() => result.current.select(folder('b')));
    act(() => result.current.select(file('e'), { range: true }));

    expect(result.current.items.map((i) => i.item._id)).toEqual([
      'b',
      'c',
      'd',
      'e',
    ]);
  });

  it('selects everything, then clears on a second toggle', () => {
    const { result } = setup();

    act(() => result.current.toggleAll());

    expect(result.current.allSelected).toBe(true);
    expect(result.current.count).toBe(visible.length);

    act(() => result.current.toggleAll());

    expect(result.current.count).toBe(0);
  });

  it('starts over when the folder, space or search changes', () => {
    const { result, rerender } = setup();

    act(() => result.current.select(file('c')));
    rerender({ items: visible, key: 'other-folder' });

    expect(result.current.count).toBe(0);
  });

  it('clears on Escape', () => {
    const { result } = setup();

    act(() => result.current.select(file('c')));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.count).toBe(0);
  });
});

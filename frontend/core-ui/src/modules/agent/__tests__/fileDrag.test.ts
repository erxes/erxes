import {
  FILE_DRAG_IDLE,
  dragFileCount,
  fileDragReducer,
  isExternalFileDrag,
  isFileDragOverlayVisible,
  type IFileDragState,
  type TFileDragAction,
} from '../utils/fileDrag';

const run = (...actions: TFileDragAction[]): IFileDragState =>
  actions.reduce(fileDragReducer, FILE_DRAG_IDLE);

describe('fileDragReducer', () => {
  it('stays open while the pointer crosses nested children', () => {
    const state = run(
      { type: 'enter', count: 2, availability: 'ready' },
      // Entering a child fires its dragenter before the parent's dragleave.
      { type: 'enter', availability: 'ready' },
      { type: 'leave' },
    );
    expect(state).toEqual({ depth: 1, count: 2, availability: 'ready' });
    expect(isFileDragOverlayVisible(state)).toBe(true);
  });

  it('closes when the last nested leave arrives and never goes negative', () => {
    const state = run(
      { type: 'enter', availability: 'ready' },
      { type: 'leave' },
      { type: 'leave' },
    );
    expect(state).toBe(FILE_DRAG_IDLE);
    expect(isFileDragOverlayVisible(state)).toBe(false);
  });

  it('resets on drop or cancel', () => {
    const state = run(
      { type: 'enter', availability: 'ready' },
      { type: 'enter', availability: 'ready' },
      { type: 'reset' },
    );
    expect(state).toBe(FILE_DRAG_IDLE);
    expect(fileDragReducer(FILE_DRAG_IDLE, { type: 'reset' })).toBe(
      FILE_DRAG_IDLE,
    );
  });

  it('keeps the same state for repeated dragover and tracks availability changes', () => {
    const open = run({ type: 'enter', availability: 'ready' });
    expect(fileDragReducer(open, { type: 'over', availability: 'ready' })).toBe(
      open,
    );
    const busy = fileDragReducer(open, {
      type: 'over',
      availability: 'disabled',
    });
    expect(busy.depth).toBe(1);
    expect(isFileDragOverlayVisible(busy)).toBe(false);
    expect(
      fileDragReducer(FILE_DRAG_IDLE, { type: 'over', availability: 'ready' }),
    ).toBe(FILE_DRAG_IDLE);
  });

  it('shows the overlay for a full composer but not a disabled one', () => {
    expect(
      isFileDragOverlayVisible(run({ type: 'enter', availability: 'full' })),
    ).toBe(true);
    expect(
      isFileDragOverlayVisible(run({ type: 'enter', availability: 'disabled' })),
    ).toBe(false);
  });
});

describe('isExternalFileDrag', () => {
  it('accepts only file drags that started outside the page', () => {
    expect(isExternalFileDrag({ types: ['Files'] }, false)).toBe(true);
    expect(isExternalFileDrag({ types: ['text/plain'] }, false)).toBe(false);
    expect(
      isExternalFileDrag({ types: ['text/uri-list', 'text/html'] }, false),
    ).toBe(false);
    expect(isExternalFileDrag({ types: ['Files', 'text/html'] }, true)).toBe(
      false,
    );
    expect(isExternalFileDrag(null, false)).toBe(false);
  });
});

describe('dragFileCount', () => {
  const items = (...kinds: string[]) =>
    ({ items: kinds.map((kind) => ({ kind })) }) as unknown as Pick<
      DataTransfer,
      'items'
    >;

  it('counts file items and hides unknown counts', () => {
    expect(dragFileCount(items('file', 'file', 'string'))).toBe(2);
    expect(dragFileCount(items())).toBeUndefined();
    expect(dragFileCount(null)).toBeUndefined();
  });
});

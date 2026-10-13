/** @jest-environment jsdom */
import { getEditorVisibleBounds } from '../toolbar/getEditorVisibleBounds';
import { getToolbarPositioning } from '../toolbar/getToolbarPositioning';

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
): DOMRect => ({
  x,
  y,
  width,
  height,
  left: x,
  top: y,
  right: x + width,
  bottom: y + height,
  toJSON: () => ({ x, y, width, height }),
});

const makeEditor = () => {
  const editor = document.createElement('div');
  jest
    .spyOn(editor, 'getBoundingClientRect')
    .mockReturnValue(rect(100, 100, 500, 30));
  document.body.appendChild(editor);
  return editor;
};

afterEach(() => {
  document.body.replaceChildren();
  jest.restoreAllMocks();
});

test('positions the toolbar on mount and releases its update listeners', () => {
  const editor = makeEditor();
  const floating = document.createElement('div');
  const update = jest.fn();
  const options = getToolbarPositioning(() => editor);
  const cleanup = options?.whileElementsMounted?.(editor, floating, update);

  expect(update).toHaveBeenCalledTimes(1);
  window.dispatchEvent(new Event('resize'));
  expect(update).toHaveBeenCalledTimes(2);
  cleanup?.();
  window.dispatchEvent(new Event('resize'));
  expect(update).toHaveBeenCalledTimes(2);
});

test('allows a toolbar above a one-line editor without covering its selection', async () => {
  const editor = makeEditor();
  const reference = document.createElement('div');
  const floating = document.createElement('div');
  floating.style.maxWidth = '500px';
  const referenceRect = rect(136, 106, 100, 18);
  jest.spyOn(reference, 'getBoundingClientRect').mockReturnValue(referenceRect);
  const rects = { reference: referenceRect, floating: rect(0, 0, 500, 64) };
  const boundary = getToolbarPositioning(() => editor)?.middleware?.[0];
  if (!boundary) throw new Error('Missing editor boundary middleware');

  const result = await boundary.fn({
    x: 136,
    y: 32,
    initialPlacement: 'top-start',
    placement: 'top-start',
    strategy: 'absolute',
    middlewareData: {},
    rects,
    elements: { reference, floating },
    platform: {
      getElementRects: async () => rects,
      getClippingRect: async () => rect(0, 0, 1024, 768),
      getDimensions: async () => ({ width: 500, height: 64 }),
    },
  });

  expect(result.y).toBe(32);
  expect((result.y ?? 0) + rects.floating.height).toBeLessThan(
    referenceRect.top,
  );
});

test('clips each axis only when an ancestor actually clips that axis', () => {
  const parent = document.createElement('div');
  parent.style.overflowY = 'hidden';
  parent.style.overflowX = 'visible';
  jest
    .spyOn(parent, 'getBoundingClientRect')
    .mockReturnValue(rect(200, 50, 300, 150));
  const editor = makeEditor();
  parent.appendChild(editor);
  document.body.appendChild(parent);

  expect(getEditorVisibleBounds(editor)).toEqual({
    top: 50,
    bottom: 200,
    left: 100,
    right: 600,
  });
});

/** @jest-environment jsdom */
import {
  capturePageSelection,
  isSelectableElement,
  selectionGeometry,
  selectionVisibleText,
} from '../utils/pageSelection';
import { domToCanvas } from 'modern-screenshot';

jest.mock('modern-screenshot', () => ({ domToCanvas: jest.fn() }));
const bounds = (
  x: number,
  y: number,
  width: number,
  height: number,
): DOMRect => ({
  x,
  y,
  left: x,
  top: y,
  width,
  height,
  right: x + width,
  bottom: y + height,
  toJSON: () => ({}),
});
const measure = (node: Element, rect: DOMRect) =>
  jest.spyOn(node, 'getBoundingClientRect').mockReturnValue(rect);
const element = () => {
  const node = document.createElement('div');
  node.style.opacity = '1';
  document.body.append(node);
  measure(node, bounds(40, 60, 200, 100));
  return node;
};
afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

it('clips a selection to the scroll viewport without capturing offscreen content', () => {
  const viewport = document.createElement('div');
  viewport.style.overflowX = 'hidden';
  viewport.style.overflowY = 'auto';
  document.body.append(viewport);
  measure(viewport, bounds(20, 30, 120, 80));
  Object.defineProperty(viewport, 'clientWidth', { value: 120 });
  Object.defineProperty(viewport, 'clientHeight', { value: 80 });
  const node = element();
  viewport.append(node);
  expect(selectionGeometry(node)).toEqual({
    local: { x: 40, y: 60, width: 100, height: 50 },
    screen: { x: 40, y: 60, width: 100, height: 50 },
  });
});

it('selects across frame realms and clips against the frame and outer viewport', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  measure(frame, bounds(100, 120, 300, 200));
  Object.defineProperty(frame, 'clientWidth', { value: 300 });
  Object.defineProperty(frame, 'clientHeight', { value: 200 });
  const doc = frame.contentDocument;
  if (!doc) throw new Error('No frame document');
  const node = doc.createElement('p');
  node.style.opacity = '1';
  doc.body.append(node);
  measure(node, bounds(270, 160, 100, 100));
  expect(isSelectableElement(node)).toBe(true);
  expect(selectionGeometry(node)).toEqual({
    local: { x: 270, y: 160, width: 30, height: 40 },
    screen: { x: 370, y: 280, width: 30, height: 40 },
  });
});

it('never selects private, password, hidden, or picker UI elements', () => {
  const node = element();
  node.dataset.private = '';
  expect(isSelectableElement(node)).toBe(false);
  delete node.dataset.private;
  node.dataset.agentSelectionUi = '';
  expect(isSelectableElement(node)).toBe(false);
  const input = document.createElement('input');
  input.type = 'password';
  input.value = 'secret';
  document.body.append(input);
  measure(input, bounds(0, 0, 100, 20));
  expect(isSelectableElement(input)).toBe(false);
});

it('extracts only visible bounded text, without markup, hidden labels, or form values', () => {
  const node = element();
  node.innerHTML =
    '<p style="opacity:1">Visible revenue</p><p hidden>hidden</p><p data-private>private</p><input value="secret"><p style="opacity:1">Below viewport</p>';
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value: function (this: Range) {
      const outside =
        this.commonAncestorContainer.textContent?.includes('Below');
      return [bounds(40, outside ? 500 : 60, 100, 20)];
    },
  });
  expect(
    selectionVisibleText(node, { x: 40, y: 60, width: 200, height: 100 }),
  ).toBe('Visible revenue');
});

it('captures with scroll restoration, crops to visible bounds, and returns a snapshot with visible context', async () => {
  const node = element();
  node.setAttribute('aria-label', 'Revenue chart');
  const source = document.createElement('canvas');
  source.width = 200;
  source.height = 100;
  jest.mocked(domToCanvas).mockResolvedValue(source);
  const draw = jest.fn();
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: draw,
  } as unknown as CanvasRenderingContext2D);
  jest
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((callback) =>
      callback(new Blob(['png'], { type: 'image/png' })),
    );
  const selection = await capturePageSelection(node);
  expect(domToCanvas).toHaveBeenCalledWith(
    node,
    expect.objectContaining({ features: { restoreScrollPosition: true } }),
  );
  expect(draw).toHaveBeenCalledWith(source, 0, 0, 200, 100, 0, 0, 200, 100);
  expect(selection.image.type).toBe('image/png');
  expect(selection.image.size).toBe(3);
  expect(selection.title).toBe('Revenue chart');
});

it('rejects removed and inaccessible embedded content instead of attaching a misleading image', async () => {
  const node = element();
  node.remove();
  await expect(capturePageSelection(node)).rejects.toThrow(
    'no longer available',
  );
  document.body.append(node);
  node.innerHTML = '<iframe></iframe>';
  await expect(capturePageSelection(node)).rejects.toThrow('inside the frame');
});

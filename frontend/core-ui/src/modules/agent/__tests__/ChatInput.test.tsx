/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { ChatInput } from '../components/ChatInput';

let mockResize: ResizeObserverCallback;
const mockDisconnect = jest.fn();
const mockObserver: ResizeObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: mockDisconnect,
};
const pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;

beforeEach(() => {
  mockDisconnect.mockClear();
  pendingFrames.clear();
  nextFrame = 0;
  global.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      mockResize = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = mockDisconnect;
  };
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = ++nextFrame;
    pendingFrames.set(id, callback);
    return id;
  });
  jest
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation((id) => pendingFrames.delete(id));
});

afterEach(() => {
  jest.restoreAllMocks();
});

const flushFrames = () => {
  act(() => {
    const queued = [...pendingFrames.values()];
    pendingFrames.clear();
    for (const callback of queued) callback(0);
  });
};

it('keeps a usable line when mounted hidden and remeasures when shown or resized', () => {
  const { unmount } = render(
    <ChatInput value="Draft" onChange={jest.fn()} ariaLabel="Message" />,
  );
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(input.style.height).toBe('20px');
  let height = 240;
  Object.defineProperty(input, 'scrollHeight', {
    configurable: true,
    get: () => height,
  });
  const trigger = (width: number) => {
    // ResizeObserver entries are supplied by the browser in production.
    mockResize(
      [{ target: input, contentRect: { width } } as ResizeObserverEntry],
      mockObserver,
    );
  };
  act(() => trigger(360));
  expect(input.style.height).toBe('20px');
  expect(pendingFrames.size).toBe(1);
  flushFrames();
  expect(input.style.height).toBe('168px');
  expect(input.style.overflowY).toBe('auto');
  const scheduled = nextFrame;
  act(() => trigger(360));
  expect(nextFrame).toBe(scheduled);
  expect(input.style.height).toBe('168px');
  height = 40;
  act(() => trigger(500));
  act(() => {
    height = 80;
    trigger(640);
  });
  expect(pendingFrames.size).toBe(1);
  flushFrames();
  expect(input.style.height).toBe('80px');
  expect(input.style.overflowY).toBe('hidden');
  unmount();
  expect(mockDisconnect).toHaveBeenCalled();
});

it('cancels a pending remeasure when the field unmounts', () => {
  const { unmount } = render(
    <ChatInput value="Draft" onChange={jest.fn()} ariaLabel="Message" />,
  );
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  act(() => {
    mockResize(
      [{ target: input, contentRect: { width: 320 } } as ResizeObserverEntry],
      mockObserver,
    );
  });
  expect(pendingFrames.size).toBe(1);
  unmount();
  expect(pendingFrames.size).toBe(0);
});

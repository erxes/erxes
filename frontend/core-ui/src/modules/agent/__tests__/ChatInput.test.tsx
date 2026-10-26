/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { ChatInput } from '../components/ChatInput';

let mockResize: ResizeObserverCallback;
let frames: FrameRequestCallback[] = [];
const mockDisconnect = jest.fn();
const mockObserver: ResizeObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: mockDisconnect,
};

beforeEach(() => {
  mockDisconnect.mockClear();
  frames = [];
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => frames.push(callback));
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
    frames = [];
  });
  global.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      mockResize = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = mockDisconnect;
  };
});

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
  // Remeasuring waits for the next frame, outside the observer callback.
  const flushFrame = () => frames.splice(0).forEach((frame) => frame(0));
  act(() => trigger(360));
  expect(input.style.height).toBe('20px');
  act(flushFrame);
  expect(input.style.height).toBe('168px');
  expect(input.style.overflowY).toBe('auto');
  height = 40;
  act(() => trigger(500));
  act(flushFrame);
  expect(input.style.height).toBe('40px');
  expect(input.style.overflowY).toBe('hidden');
  unmount();
  expect(mockDisconnect).toHaveBeenCalled();
});

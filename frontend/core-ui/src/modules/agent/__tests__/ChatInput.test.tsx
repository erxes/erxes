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

beforeEach(() => {
  mockDisconnect.mockClear();
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
  act(() => trigger(360));
  expect(input.style.height).toBe('168px');
  expect(input.style.overflowY).toBe('auto');
  height = 40;
  act(() => trigger(500));
  expect(input.style.height).toBe('40px');
  expect(input.style.overflowY).toBe('hidden');
  unmount();
  expect(mockDisconnect).toHaveBeenCalled();
});

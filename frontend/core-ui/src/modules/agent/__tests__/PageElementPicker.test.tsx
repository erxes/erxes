/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';
import { PageElementPicker } from '../components/PageElementPicker';
import {
  capturePageSelection,
  type IPageSelection,
} from '../utils/pageSelection';
jest.mock('erxes-ui', () => ({
  Button: ({
    size: _size,
    variant: _variant,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: string;
    variant?: string;
  }) => {
    void _variant;
    void _size;
    return <button {...props} />;
  },
  Spinner: () => <span />,
}));
jest.mock('../utils/pageSelection', () => ({
  ...jest.requireActual('../utils/pageSelection'),
  capturePageSelection: jest.fn(),
}));
const capture = jest.mocked(capturePageSelection);
const selection: IPageSelection = {
  title: 'Revenue',
  path: '/sales',
  text: 'Revenue',
  image: new Blob(['png']),
  width: 200,
  height: 100,
};
const measure = (node: Element) => {
  jest.spyOn(node, 'getBoundingClientRect').mockReturnValue({
    x: 40,
    y: 80,
    left: 40,
    top: 80,
    width: 200,
    height: 100,
    right: 240,
    bottom: 180,
  } as DOMRect);
  node.setAttribute('style', 'opacity:1');
};
beforeEach(() => {
  capture.mockReset();
  capture.mockResolvedValue(selection);
});
afterEach(() => jest.restoreAllMocks());

it('frames the hovered element and captures its click without activating the page button', async () => {
  const activate = jest.fn();
  const onSelect = jest.fn();
  render(
    <>
      <button onClick={activate}>Revenue</button>
      <PageElementPicker onSelect={onSelect} onCancel={jest.fn()} />
    </>,
  );
  const button = screen.getByRole('button', { name: 'Revenue' });
  measure(button);
  fireEvent.pointerMove(button);
  expect(screen.getByText('button · 200 × 100')).toBeTruthy();
  fireEvent.click(button);
  await waitFor(() => expect(onSelect).toHaveBeenCalledWith(selection));
  expect(activate).not.toHaveBeenCalled();
  expect(capture).toHaveBeenCalledWith(button);
});

it('selects rendered HTML inside a same-origin sandbox without navigating its link', async () => {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  document.body.append(frame);
  const doc = frame.contentDocument;
  if (!doc) throw new Error('Frame missing');
  const link = doc.createElement('a');
  link.href = '/different';
  link.textContent = 'Report';
  doc.body.append(link);
  measure(link);
  const activate = jest.fn();
  link.addEventListener('click', activate);
  const onSelect = jest.fn();
  render(<PageElementPicker onSelect={onSelect} onCancel={jest.fn()} />);
  fireEvent.pointerMove(link);
  fireEvent.click(link);
  await waitFor(() => expect(onSelect).toHaveBeenCalledWith(selection));
  expect(capture).toHaveBeenCalledWith(link);
  expect(activate).not.toHaveBeenCalled();
  frame.remove();
});

it('supports parent selection and Escape, then removes every interception listener', () => {
  const activate = jest.fn();
  const cancel = jest.fn();
  const { unmount } = render(
    <>
      <section aria-label="Totals">
        <button onClick={activate}>Revenue</button>
      </section>
      <PageElementPicker onSelect={jest.fn()} onCancel={cancel} />
    </>,
  );
  const button = screen.getByRole('button', { name: 'Revenue' });
  const parent = screen.getByRole('region', { name: 'Totals' });
  measure(button);
  measure(parent);
  fireEvent.pointerMove(button);
  fireEvent.keyDown(button, { key: 'ArrowUp' });
  expect(screen.getByText('section · 200 × 100')).toBeTruthy();
  fireEvent.keyDown(button, { key: 'Escape' });
  expect(cancel).toHaveBeenCalledTimes(1);
  unmount();
  document.body.append(button);
  fireEvent.click(button);
  expect(activate).not.toHaveBeenCalled();
  // React unmounted the handler; a native control is now free to receive clicks.
  const native = jest.fn();
  button.addEventListener('click', native);
  fireEvent.click(button);
  expect(native).toHaveBeenCalledTimes(1);
  button.remove();
  expect(document.documentElement.style.cursor).toBe('');
});

it('reports capture failure with retry and ignores a capture completed after cancel', async () => {
  const onSelect = jest.fn();
  let complete: (value: IPageSelection) => void = () => undefined;
  capture
    .mockRejectedValueOnce(new Error('Capture failed'))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
  const { unmount } = render(
    <>
      <p>Revenue</p>
      <PageElementPicker onSelect={onSelect} onCancel={jest.fn()} />
    </>,
  );
  const node = screen.getByText('Revenue');
  measure(node);
  fireEvent.click(node);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  unmount();
  await act(async () => complete(selection));
  expect(onSelect).not.toHaveBeenCalled();
});

it('blocks clicks into inaccessible frames and explains how to choose another component', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  measure(frame);
  Object.defineProperty(frame, 'contentDocument', { value: null });
  render(<PageElementPicker onSelect={jest.fn()} onCancel={jest.fn()} />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Embedded content cannot be selected' }),
  );
  expect(screen.getByRole('alert').textContent).toContain('outside the frame');
  expect(capture).not.toHaveBeenCalled();
  frame.remove();
});

import { AgentReferenceScope } from '../../references/AgentReferenceScope';
import { createAgentReferenceRegistry } from '../../references/referenceRegistry';
/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { HtmlPreview } from '../HtmlPreview';

jest.mock('erxes-ui', () => ({ Input: 'input', Button: 'button' }));

const mockOpen = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../../components/AgentReferenceChip', () => ({
  AgentReferenceChip: ({
    reference,
  }: {
    reference: { id: string; label: string };
  }) => (
    <button onClick={() => mockNavigate(reference.id)}>
      {reference.label}
    </button>
  ),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(window, 'open').mockImplementation(mockOpen);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  mockOpen.mockClear();
  mockNavigate.mockClear();
});

it('renders styled HTML in a script-disabled frame, sizes to the response, and updates without reloading', async () => {
  const { rerender } = render(
    <HtmlPreview html='<html lang="mn"><head><style>h2{color:green}</style></head><body style="font-size:16px"><h2>Revenue</h2></body></html>' />,
  );
  const frame = screen.getByTitle('HTML artifact preview') as HTMLIFrameElement;
  const document = frame.contentDocument;
  if (!document) throw new Error('Preview document missing');
  jest
    .spyOn(document.body, 'getBoundingClientRect')
    .mockReturnValue({ height: 740 } as DOMRect);
  fireEvent.load(frame);
  expect(frame.getAttribute('sandbox')).toBe('allow-same-origin');
  expect(frame.getAttribute('sandbox')).not.toContain('allow-scripts');
  expect(frame.style.height).toBe('740px');
  expect(document.head.textContent).toContain('h2{color:green}');
  expect(document.body.style.fontSize).toBe('16px');
  expect(document.documentElement.lang).toBe('mn');
  expect(document.body.textContent).toBe('Revenue');
  const initialSrc = frame.srcdoc;
  rerender(
    <HtmlPreview html="<h2>Updated revenue</h2><script>alert(1)</script>" />,
  );
  act(() => jest.advanceTimersByTime(120));
  expect(frame.srcdoc).toBe(initialSrc);
  expect(document.body.textContent).toBe('Updated revenue');
  expect(document.body.style.fontSize).toBe('');
  expect(document.querySelector('script')).toBeNull();
  await act(async () => {
    await Promise.resolve();
  });
});

it('renders real record controls in the frame and opens external links safely without frame navigation', async () => {
  render(
    <AgentReferenceScope.Provider
      value={createAgentReferenceRegistry([
        { type: 'customer', id: 'c1', label: 'Acme' },
      ])}
    >
      <HtmlPreview
        html='<p>Open [[customer:c1:Acme]]</p><a href="https://example.com">Website</a><a href="/settings">Internal URL</a>'
        references
      />
    </AgentReferenceScope.Provider>,
  );
  const frame = screen.getByTitle('HTML artifact preview') as HTMLIFrameElement;
  fireEvent.load(frame);
  const document = frame.contentDocument;
  if (!document) throw new Error('Preview document missing');
  const button = document.querySelector('button');
  const external = document.querySelector('a');
  if (!button || !external) throw new Error('Preview controls missing');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledWith('c1');
  fireEvent.click(external);
  expect(mockOpen).toHaveBeenCalledWith(
    'https://example.com',
    '_blank',
    'noopener,noreferrer',
  );
  expect(document.querySelectorAll('a')).toHaveLength(1);
  expect(document.body.textContent).toContain('Internal URL');
  expect(mockOpen).toHaveBeenCalledTimes(1);
  await act(async () => {
    await Promise.resolve();
  });
});

it('syncs authoritative host tokens on a theme change without replacing the report', async () => {
  const { unmount } = render(
    <HtmlPreview html='<p style="color:black!important;--foreground:black">Report</p>' />,
  );
  const frame = screen.getByTitle('HTML artifact preview') as HTMLIFrameElement;
  frame.style.setProperty('--foreground', '#242424');
  fireEvent.load(frame);
  await act(async () => {
    await Promise.resolve();
  });
  const document = frame.contentDocument;
  if (!document) throw new Error('Preview missing');
  const report = document.querySelector('p');
  expect(document.documentElement.style.getPropertyValue('--foreground')).toBe(
    '#242424',
  );
  expect(
    document.documentElement.style.getPropertyPriority('--foreground'),
  ).toBe('important');
  const source = frame.srcdoc;
  await act(async () => {
    frame.style.setProperty('--foreground', '#f5f5f5');
    window.document.documentElement.classList.add('dark');
    await Promise.resolve();
  });
  expect(document.documentElement.style.getPropertyValue('--foreground')).toBe(
    '#f5f5f5',
  );
  expect(document.querySelector('p')).toBe(report);
  expect(frame.srcdoc).toBe(source);
  unmount();
  window.document.documentElement.classList.remove('dark');
});

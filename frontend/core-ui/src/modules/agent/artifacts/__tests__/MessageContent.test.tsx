/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { MessageContent } from '../MessageContent';

jest.mock('../HtmlPreview', () => ({
  HtmlPreview: ({ html }: { html: string }) => (
    <div data-testid="html-view">{html}</div>
  ),
}));

it.each([
  '**Done** successfully.',
  '<p>Hello!</p>',
  '<!doctype html><html><body><p>Hello!</p></body></html>',
  '```html Hello.html\n<p>Hello!</p>\n```',
  '```html artifact Hello\n<p>Hello!</p>\n```',
  'Your file:\n```xlsx Sales\nName,Value\nA,20\n```',
  '```pdf Report\n# Report\n```',
  '```docx Report\n# Report\n```',
])('text alone never creates file controls: %s', (content) => {
  render(<MessageContent content={content} />);
  expect(screen.getByTestId('html-view')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});

it('updates an incomplete reply in place as more HTML arrives', () => {
  const { rerender } = render(
    <MessageContent content={'```html artifact Summary\n<p>Growing'} />,
  );
  expect(screen.getByTestId('html-view').textContent).toBe('<p>Growing');
  rerender(
    <MessageContent
      content={'```html artifact Summary\n<p>Growing report</p>\n```'}
    />,
  );
  expect(screen.getByTestId('html-view').textContent).toBe(
    '<p>Growing report</p>',
  );
  expect(screen.queryByRole('button')).toBeNull();
});

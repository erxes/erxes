/** @jest-environment jsdom */
import { getReplyCopyText } from '../replyText';

it('copies the visible HTML response with line breaks and readable record labels', () => {
  expect(
    getReplyCopyText(
      '```html Summary\n<style>p{color:red}</style><h2>Summary</h2><p>Open [[customer:c1:Acme]]</p><p>Done<br>Today</p><script>alert(1)</script>\n```',
    ),
  ).toBe('Summary\nOpen Acme\nDone\nToday');
});

it('copies raw HTML and preserves the old clipboard format for non-HTML replies and files', () => {
  expect(getReplyCopyText('<p>Hello <strong>team</strong></p>')).toBe(
    'Hello team',
  );
  expect(getReplyCopyText('**Hello** team')).toBe('**Hello** team');
  const file = '```xlsx Sales\nName,Value\nA,20\n```';
  expect(getReplyCopyText(file)).toBe(file);
});

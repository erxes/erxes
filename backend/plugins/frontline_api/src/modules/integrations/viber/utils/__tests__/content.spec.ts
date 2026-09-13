import { test } from 'node:test';
import { strictEqual, throws } from 'node:assert';
import { formatViberText } from '../content';

test('wraps plain text without trimming it or changing Unicode characters', () => {
  strictEqual(formatViberText('  Сайн уу 👋  '), '<p>  Сайн уу 👋  </p>');
});

test('escapes markup, quotes, and entity-like text as literal message text', () => {
  strictEqual(
    formatViberText('<hello> &amp; "quoted" \'text\''),
    '<p>&lt;hello&gt; &amp;amp; &quot;quoted&quot; &#x27;text&#x27;</p>',
  );
});

test('preserves line breaks after escaping text, including consecutive breaks', () => {
  for (const newline of ['\n', '\r\n', '\r']) {
    strictEqual(
      formatViberText(`first <hello>${newline}${newline}second & third`),
      '<p>first &lt;hello&gt;<br><br>second &amp; third</p>',
    );
  }
});

test('rejects empty or whitespace-only messages', () => {
  for (const text of ['', '   ', '\t\r\n']) {
    throws(() => formatViberText(text), {
      message: 'Invalid Viber text message',
    });
  }
});

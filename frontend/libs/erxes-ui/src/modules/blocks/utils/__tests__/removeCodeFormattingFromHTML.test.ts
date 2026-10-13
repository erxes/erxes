/** @jest-environment jsdom */
import { removeCodeFormattingFromHTML } from '../removeCodeFormattingFromHTML';

test('exports code as plain code while preserving formatting outside code', () => {
  const html =
    '<p><strong>Before</strong> <code class="font-normal!"><strong><em><span data-text-color="red">code &amp; text</span></em></strong></code> <u>After</u></p>';

  expect(removeCodeFormattingFromHTML(html)).toBe(
    '<p><strong>Before</strong> <code>code &amp; text</code> <u>After</u></p>',
  );
});

test('preserves literal markup, whitespace and unicode in code', () => {
  const html =
    '<p><code><strong>  &lt;script&gt;Монгол\n&lt;/script&gt;  </strong></code></p>';
  const result = removeCodeFormattingFromHTML(html);
  const template = document.createElement('template');
  template.innerHTML = result;

  expect(template.content.querySelector('code')?.textContent).toBe(
    '  <script>Монгол\n</script>  ',
  );
  expect(template.content.querySelector('script')).toBeNull();
});

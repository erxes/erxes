import { createAgentReferenceRegistry } from '../../references/referenceRegistry';
/** @jest-environment jsdom */
import { replyToHtml } from '../replyHtml';
import { buildSandboxedSrcDoc } from '../htmlSandbox';
import { mountHtmlReferences } from '../htmlReferences';

it('keeps new HTML replies as HTML and converts historical prose into semantic HTML', () => {
  expect(replyToHtml('<section><h2>Revenue</h2><p>$200</p></section>')).toBe(
    '<section><h2>Revenue</h2><p>$200</p></section>',
  );
  expect(
    replyToHtml('## Summary\n\n**Sales** grew.\n\n- One\n- Two'),
  ).toContain('<h2>Summary</h2>');
  expect(replyToHtml('**Sales** grew.')).toBe(
    '<p><strong>Sales</strong> grew.</p>',
  );
  expect(replyToHtml('x < 3 & y > 2')).toBe('<p>x &lt; 3 &amp; y &gt; 2</p>');
});

it('preserves reference labels through legacy parsing and never turns tokens in code or links into navigation', () => {
  const html = replyToHtml(
    'Open [[customer:c1:Acme_**Team**]] and `[[company:c2:Literal]]`.',
  );
  const doc = new DOMParser().parseFromString(
    buildSandboxedSrcDoc(
      html +
        '<a href="https://example.com">[[customer:c3:Link]]</a><pre>[[customer:c4:Example]]</pre>',
    ),
    'text/html',
  );
  const mounts = mountHtmlReferences(
    doc,
    createAgentReferenceRegistry([
      { type: 'customer', id: 'c1', label: 'Acme_**Team**' },
    ]),
  );
  expect(mounts.map(({ reference }) => reference)).toEqual([
    { type: 'customer', id: 'c1', label: 'Acme_**Team**' },
  ]);
  expect(doc.querySelector('code')?.textContent).toBe('[[company:c2:Literal]]');
  expect(doc.querySelector('a')?.textContent).toBe('[[customer:c3:Link]]');
  expect(doc.querySelector('pre')?.textContent).toBe('[[customer:c4:Example]]');
});

it('supports reference chips inside raw HTML tables without trusting attributes or malformed tokens', () => {
  const doc = new DOMParser().parseFromString(
    buildSandboxedSrcDoc(
      '<table><tr><td>[[deal:d1:Big &amp; Small]]</td><td>[[unknown:x:No]]</td></tr></table><p title="[[customer:c2:Attribute]]">[[customer:bad/id:No]]</p>',
    ),
    'text/html',
  );
  const mounts = mountHtmlReferences(
    doc,
    createAgentReferenceRegistry([
      { type: 'deal', id: 'd1', label: 'Big & Small' },
    ]),
  );
  expect(mounts).toHaveLength(1);
  expect(mounts[0].reference.label).toBe('Big & Small');
  expect(mounts[0].element.closest('td')).not.toBeNull();
});

it('renders invented handles and legacy ids as non-clickable text', () => {
  const doc = new DOMParser().parseFromString(
    '<p>[[ref:invented]] [[customer:fake:Claimed name]]</p>',
    'text/html',
  );
  expect(mountHtmlReferences(doc)).toEqual([]);
  expect(doc.body.textContent).toBe('Reference unavailable Claimed name');
});
it('uses the registered canonical name even when legacy prose changes it', () => {
  const doc = new DOMParser().parseFromString(
    '<p>[[customer:c1:Wrong name]]</p>',
    'text/html',
  );
  const mounts = mountHtmlReferences(
    doc,
    createAgentReferenceRegistry([
      { type: 'customer', id: 'c1', label: 'Verified name' },
    ]),
  );
  expect(mounts[0].reference.label).toBe('Verified name');
});

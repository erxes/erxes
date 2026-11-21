import { describe, expect, it } from 'vite-plus/test';
import { emailDoc, field, linkTo, say, useBroadcasts } from './broadcasts.fixture';
import { useTestDatabase } from './db';

/** An email broadcast's content: the email editor's document, rendered by core. */
describe('broadcast content', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  it('refuses raw HTML and script links, and escapes what customers and members wrote', async () => {
    const owner = t.owner();

    await expect(
      owner.broadcasts.create({
        name: 'Typo',
        channel: 'email',
        content: say('Hi ', field('fristName')),
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PLACEHOLDER',
      data: { placeholders: ['fristName'] },
    });

    // Raw HTML, script links and pictures from anywhere but the web are refused.
    const refused = [
      say(linkTo('win', 'javascript:alert(1)')),
      say(linkTo('win', ' JaVaScRiPt:alert(1)')),
      emailDoc({ type: 'image', attrs: { src: 'data:image/svg+xml,1' } }),
      emailDoc({ type: 'button', attrs: { url: 'vbscript:x' }, content: [] }),
      emailDoc({ type: 'htmlCodeBlock', content: [{ type: 'text', text: '<script>1</script>' }] }),
      emailDoc({ type: 'script' }),
      say(field('firstName', '}} {{ x')),
    ];

    const answers = await Promise.all(
      refused.map((content) => t.emailTo('news', { content }).catch((error: unknown) => error)),
    );

    expect(answers).toMatchObject(refused.map(() => ({ status: 400, code: 'INVALID_INPUT' })));

    // An email's text is its content's, never HTML or Markdown a client wrote.
    await expect(
      owner.broadcasts.create({ name: 'Raw', channel: 'email', body: '<script>1</script>' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      owner.broadcasts.create({ name: 'Text', channel: 'sms', content: say('Hi') }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    await t.customersIn('esc', [
      { firstName: '<script>alert(1)</script>', primaryEmail: 'x@esc.mn' },
    ]);

    const scripted = await t.emailTo('esc', {
      content: say(
        '<b onclick="x">hi</b> ',
        field('firstName', 'you'),
        ' ',
        linkTo('mail', 'mailto:a@acme.mn'),
      ),
    });

    const { html } = await owner.broadcasts.preview({ id: scripted.id });

    expect(html).not.toMatch(/<script|<b /);
    expect(html).toContain('&lt;b onclick=&quot;x&quot;&gt;hi&lt;/b&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('href="mailto:a@acme.mn"');

    // A fallback is shown as written, escaped once (sample values have no position).
    const fallback = await t.emailTo('nobody', {
      content: say(field('position', '<O’Neil & co>')),
    });

    expect((await owner.broadcasts.preview({ id: fallback.id })).html).toContain(
      '&lt;O’Neil &amp; co&gt;',
    );
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { partsOf, postChat, threadIdOf, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { fakeModel, lastToolResult } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0006';

describe('assistant artifacts', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const create = async (input: Record<string, unknown>) => {
    model.script((request) =>
      lastToolResult(request) === null
        ? { tool: 'createArtifact', input }
        : { text: 'Here it is.' },
    );

    const reply = await postChat(t.url('/core/v1/assistant/chat'), await t.token(), {
      model: 'kimi-k3',
      message: userMessage('Make me a file'),
    });

    const thread = await t.owner().assistant.thread({ id: threadIdOf(reply.chunks) });

    return partsOf(thread.messages[1]).find((part) => part.type === 'tool-createArtifact');
  };

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('returns a CSV document with a safe file name as the tool result', async () => {
    const part = await create({
      format: 'csv',
      title: 'Top customers: Q3/2026',
      content: 'Customer,Won deals\nNomin Trade,4\n"Altai, LLC",3\n',
    });

    expect(part).toMatchObject({
      state: 'output-available',
      output: {
        format: 'csv',
        title: 'Top customers: Q3/2026',
        filename: 'Top-customers-Q3-2026.csv',
        content: 'Customer,Won deals\nNomin Trade,4\n"Altai, LLC",3',
      },
    });
  });

  it('keeps an HTML report and a Markdown document as written', async () => {
    const html = await create({
      format: 'html',
      title: 'Sales report',
      content:
        '<h1>Sales</h1><ul class="kpis"><li class="kpi"><span>Won</span><strong>12</strong></li></ul>',
    });

    const markdown = await create({
      format: 'markdown',
      title: 'Meeting notes',
      content: '# Notes\n\n- Call Nomin on Monday',
    });

    expect(html).toMatchObject({
      state: 'output-available',
      output: { filename: 'Sales-report.html' },
    });
    expect(markdown).toMatchObject({
      state: 'output-available',
      output: { filename: 'Meeting-notes.md' },
    });
  });

  it('refuses a CSV whose rows do not match its header, and tells the model why', async () => {
    const part = await create({
      format: 'csv',
      title: 'Broken',
      content: 'Customer,Won deals\nNomin Trade,4,extra\n',
    });

    expect(part?.state).toBe('output-error');
    expect(model.lastToolResult()).toMatch(/row 2 has 3 columns; the header has 2/i);
  });

  it('refuses HTML with scripts, event handlers or outside resources', async () => {
    const scripted = await create({
      format: 'html',
      title: 'Bad',
      content: '<p>Hi</p><script>alert(1)</script>',
    });

    const handler = await create({
      format: 'html',
      title: 'Bad',
      content: '<img src="x" onerror="alert(1)">',
    });

    const remote = await create({
      format: 'html',
      title: 'Bad',
      content: '<img src="https://tracker.example/p.png">',
    });

    expect([scripted?.state, handler?.state, remote?.state]).toEqual([
      'output-error',
      'output-error',
      'output-error',
    ]);
    expect(model.lastToolResult()).toMatch(/outside resources/i);
  });

  it('refuses content over the size limit', async () => {
    const part = await create({
      format: 'markdown',
      title: 'Huge',
      content: 'x'.repeat(300_000),
    });

    expect(part?.state).toBe('output-error');
  });
});

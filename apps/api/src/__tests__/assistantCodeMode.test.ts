import { setTimeout as sleep } from 'node:timers/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { postChat, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { fakeModel, inSteps } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0011';

describe('assistant code mode', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const runCode = async (code: string) => {
    model.script(inSteps({ tool: 'runCode', input: { code } }, { text: 'Done.' }));

    await postChat(t.url('/core/v1/assistant/chat'), await t.token(), {
      model: 'kimi-k3',
      message: userMessage('Work it out'),
    });

    return model.lastToolResult();
  };

  const offeredTools = () => (model.chats().at(-1)?.tools ?? []).map((tool) => tool.function.name);

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('is off until an admin turns it on', async () => {
    model.script(() => ({ text: 'Hello' }));

    await postChat(t.url('/core/v1/assistant/chat'), await t.token(), {
      model: 'kimi-k3',
      message: userMessage('Hi'),
    });

    expect(await t.owner().assistant.settings({})).toMatchObject({ codeMode: false });
    expect(offeredTools()).toContain('callApi');
    expect(offeredTools()).not.toContain('runCode');
    await expect(t.member().assistant.updateSettings({ codeMode: true })).rejects.toMatchObject({
      status: 403,
    });

    expect(await t.owner().assistant.updateSettings({ codeMode: true })).toMatchObject({
      codeMode: true,
      approvalMode: 'writes',
    });
  });

  it('runs a program that reads through callApi and returns what it computed', async () => {
    await t.owner().tags.create({ type: 'customer', name: 'Wholesale' });
    await t.owner().tags.create({ type: 'customer', name: 'Retail' });

    const result = await runCode(`
      const { data } = (await callApi('tags.list', { type: 'customer' })).result;
      const found = await searchApi('customer tags');
      return { count: data.length, names: data.map((tag) => tag.name).sort(), searched: found.procedures.length > 0 };
    `);

    expect(result).toContain('"count":2');
    expect(result).toContain('["Retail","Wholesale"]');
    expect(result).toContain('"searched":true');
    expect(offeredTools()).toContain('runCode');
  });

  it('refuses a change that needs approval and leaves it for the chat', async () => {
    const result = await runCode(`
      return await callApi('tags.create', { type: 'customer', name: 'From code' });
    `);

    expect(result).toContain('APPROVAL_REQUIRED');

    const tags = await t.owner().tags.list({ type: 'customer' });

    expect(tags.data.map((tag) => tag.name)).not.toContain('From code');
  });

  it('stops a program at its time limit', async () => {
    const started = Date.now();
    const result = await runCode('while (true) {}');

    expect(result).toContain('TIMEOUT');
    expect(Date.now() - started).toBeLessThan(20_000);
  });

  it('keeps answering other requests while a program runs', async () => {
    const started = Date.now();
    let finished = false;

    const running = runCode('while (true) {}').finally(() => {
      finished = true;
    });

    await sleep(1000);

    const tags = await t.owner().tags.list({ type: 'customer' });

    expect(Date.now() - started).toBeLessThan(3000);
    expect(finished).toBe(false);
    expect(tags.data.map((tag) => tag.name)).toContain('Wholesale');
    expect(await running).toContain('TIMEOUT');
  });

  it('stops a program at its memory limit and cuts long output', async () => {
    expect(await runCode('const all = []; while (true) all.push(all.length);')).toContain(
      'OUT_OF_MEMORY',
    );

    const long = await runCode("return 'y'.repeat(200000);");

    expect(long).toContain('truncated');
    expect(long.length).toBeLessThan(60_000);
  });
});

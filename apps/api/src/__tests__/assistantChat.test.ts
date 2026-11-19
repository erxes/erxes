import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { fakeModel } from './fakeModel';
import { chat, follow, liveText, messagesOf, textOf, userMessage } from './assistantChat';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0002';

describe('assistant chat (send and watch)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('runs a reply, keeps the conversation and titles it', async () => {
    model.script(() => ({ text: 'Hello there, how can I help?' }));

    const { threadId, view } = await chat(t.owner(), {
      message: userMessage('Plan the spring sales campaign for our wholesale customers'),
      model: 'kimi-k3',
    });

    expect(textOf(view)).toBe('Hello there, how can I help?');
    expect(
      messagesOf(view)
        .filter((message) => message.role !== 'system')
        .map((message) => message.role),
    ).toEqual(['user', 'assistant']);
    expect(view.entries.find((entry) => entry.kind === 'assistant.user')?.data).toEqual([
      { type: 'text', text: 'Plan the spring sales campaign for our wholesale customers' },
    ]);

    await vi.waitFor(
      async () => {
        await expect(t.owner().assistant.thread({ id: threadId })).resolves.toMatchObject({
          title: 'Plan the spring sales campaign for',
        });
      },
      { timeout: 5000, interval: 100 },
    );

    expect(model.chats().at(-1)?.messages.at(-1)).toMatchObject({
      role: 'user',
      content: [
        { type: 'text', text: 'Plan the spring sales campaign for our wholesale customers' },
      ],
    });
  });

  it('carries on when the watcher leaves mid-answer', async () => {
    model.script(() => ({ text: 'one two three four five six seven eight', delayMs: 60 }));

    const { threadId } = await t
      .owner()
      .assistant.send({ message: userMessage('Count'), model: 'kimi-k3' });

    await follow(t.owner(), threadId, (view) => liveText(view).length > 0);

    const view = await follow(t.owner(), threadId);

    expect(textOf(view)).toBe('one two three four five six seven eight');
  });

  it('stops a reply on request and keeps what it wrote so far', async () => {
    const words = Array.from({ length: 40 }, (_, index) => `word${index}`).join(' ');

    model.script(() => ({ text: words, delayMs: 50 }));

    const { threadId } = await t
      .owner()
      .assistant.send({ message: userMessage('Write a long list'), model: 'kimi-k3' });

    await follow(t.owner(), threadId, (view) => liveText(view).length > 0);

    await expect(t.owner().assistant.stopThread({ id: threadId })).resolves.toEqual({ ok: true });

    const view = await follow(t.owner(), threadId);

    expect(textOf(view)).toMatch(/^word0/);
    expect(words.startsWith(textOf(view))).toBe(true);
    expect(textOf(view).length).toBeLessThan(words.length);
  });

  it('continues an existing thread and refuses other members on it', async () => {
    model.script(() => ({ text: 'First answer' }));

    const { threadId } = await chat(t.owner(), { message: userMessage('First'), model: 'kimi-k3' });

    model.script(() => ({ text: 'Second answer' }));

    const { view } = await chat(t.owner(), {
      threadId,
      message: userMessage('Second'),
      model: 'kimi-k3',
    });

    expect(textOf(view)).toBe('Second answer');
    expect(
      model
        .chats()
        .at(-1)
        ?.messages.filter((row) => row.role !== 'system'),
    ).toHaveLength(3);

    await expect(
      t.member().assistant.send({ threadId, message: userMessage('Mine now'), model: 'kimi-k3' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(follow(t.member(), threadId)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('asks for a key before chatting', async () => {
    await expect(t.other().assistant.send({ message: userMessage('Hi') })).rejects.toMatchObject({
      code: 'ASSISTANT_NO_CONNECTION',
    });
  });
});

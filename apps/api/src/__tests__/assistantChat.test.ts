import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { fakeModel } from './fakeModel';
import { postChat, textOf, threadIdOf, userMessage } from './assistantChat';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0002';

describe('assistant chat (POST /core/v1/assistant/chat)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const chat = async (body: Record<string, unknown>, user = t.ids.owner, org = t.ids.org) =>
    postChat(t.url('/core/v1/assistant/chat'), await t.token(user, org), body);

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
    await t.member().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('streams a reply, saves the conversation and titles it', async () => {
    model.script(() => ({ text: 'Hello there, how can I help?' }));

    const reply = await chat({
      message: userMessage('Plan the spring sales campaign for our wholesale customers'),
      model: 'kimi-k3',
    });

    expect(reply.status).toBe(200);
    expect(textOf(reply.chunks)).toBe('Hello there, how can I help?');

    const threadId = threadIdOf(reply.chunks);

    await vi.waitFor(
      async () => {
        const thread = await t.owner().assistant.thread({ id: threadId });

        expect(thread).toMatchObject({
          title: 'Plan the spring sales campaign for',
          running: false,
        });
        expect(thread.messages.map((row) => row.role)).toEqual(['user', 'assistant']);
        expect(thread.messages[1]?.parts).toContainEqual(
          expect.objectContaining({ type: 'text', text: 'Hello there, how can I help?' }),
        );
      },
      { timeout: 5000, interval: 100 },
    );

    expect(model.chats().at(-1)?.messages.at(-1)).toMatchObject({
      role: 'user',
      content: 'Plan the spring sales campaign for our wholesale customers',
    });
  });

  it('carries on and saves the reply when the browser leaves mid-answer', async () => {
    model.script(() => ({ text: 'one two three four five six seven eight', delayMs: 60 }));

    const first = await postChat(
      t.url('/core/v1/assistant/chat'),
      await t.token(),
      { message: userMessage('Count'), model: 'kimi-k3' },
      { stopAfter: (chunk) => chunk.type === 'text-delta' },
    );

    const threadId = threadIdOf(first.chunks);

    await vi.waitFor(
      async () => {
        const thread = await t.owner().assistant.thread({ id: threadId });

        expect(thread.running).toBe(false);
        expect(thread.messages[1]?.parts).toContainEqual(
          expect.objectContaining({
            type: 'text',
            text: 'one two three four five six seven eight',
          }),
        );
      },
      { timeout: 8000, interval: 100 },
    );
  });

  it('continues an existing thread and refuses other members on it', async () => {
    model.script(() => ({ text: 'First answer' }));

    const first = await chat({ message: userMessage('First'), model: 'kimi-k3' });
    const threadId = threadIdOf(first.chunks);

    model.script(() => ({ text: 'Second answer' }));
    await chat({ threadId, message: userMessage('Second'), model: 'kimi-k3' });

    expect(
      model
        .chats()
        .at(-1)
        ?.messages.filter((row) => row.role !== 'system'),
    ).toHaveLength(3);

    const taken = await chat(
      { threadId, message: userMessage('Mine now'), model: 'kimi-k3' },
      t.ids.member,
    );

    expect(taken).toMatchObject({ status: 404, error: { code: 'NOT_FOUND' } });
  });

  it('asks for a key before chatting', async () => {
    const reply = await chat({ message: userMessage('Hi') }, t.ids.otherOwner, t.ids.otherOrg);

    expect(reply).toMatchObject({ status: 400, error: { code: 'ASSISTANT_NO_CONNECTION' } });
  });
});

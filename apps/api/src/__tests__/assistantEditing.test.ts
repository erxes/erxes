import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { postChat, textOf, threadIdOf } from './assistantChat';
import { useTestDatabase } from './db';
import { type ChatRequest, fakeModel } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0007';

const said = (id: string, text: string) => ({ id, role: 'user', parts: [{ type: 'text', text }] });

const userTexts = (request: ChatRequest | undefined) =>
  (request?.messages ?? [])
    .filter((row) => row.role === 'user')
    .map((row) =>
      typeof row.content === 'string'
        ? row.content
        : (row.content ?? []).map((part) => part.text ?? '').join(''),
    );

describe('editing the newest message and asking again', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const chat = async (body: Record<string, unknown>, user = t.ids.owner) =>
    postChat(t.url('/core/v1/assistant/chat'), await t.token(user), { model: 'kimi-k3', ...body });

  const conversation = async () => {
    const first = await chat({ message: said('u1', 'First question') });
    const threadId = threadIdOf(first.chunks);

    await chat({ threadId, message: said('u2', 'Second question') });

    return threadId;
  };

  const thread = (id: string) => t.owner().assistant.thread({ id });

  const echo = () =>
    model.script((request) => ({ text: `Answer to ${userTexts(request).at(-1)}` }));

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
    await t.member().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('replaces the newest question and its reply, keeping what came before', async () => {
    echo();

    const threadId = await conversation();
    const edited = await chat({ threadId, edit: true, message: said('u2', 'Second, reworded') });

    expect(textOf(edited.chunks)).toBe('Answer to Second, reworded');
    expect(userTexts(model.chats().at(-1))).toEqual(['First question', 'Second, reworded']);

    await vi.waitFor(async () => {
      const after = await thread(threadId);

      expect(after.running).toBe(false);
      expect(after.messages.map((row) => [row.role, JSON.stringify(row.parts)])).toEqual([
        ['user', expect.stringContaining('First question')],
        ['assistant', expect.stringContaining('Answer to First question')],
        ['user', expect.stringContaining('Second, reworded')],
        ['assistant', expect.stringContaining('Answer to Second, reworded')],
      ]);
    });
  });

  it('asks again with the same question, replacing only the last reply', async () => {
    echo();

    const threadId = await conversation();
    const before = await thread(threadId);

    model.script(() => ({ text: 'A fresh answer' }));

    await chat({ threadId, edit: true, message: said('u2', 'Second question') });

    await vi.waitFor(async () => {
      const after = await thread(threadId);

      expect(after.messages).toHaveLength(4);
      expect(
        after.messages.slice(0, 3).map(({ id, role, parts }) => ({ id, role, parts })),
      ).toEqual(before.messages.slice(0, 3).map(({ id, role, parts }) => ({ id, role, parts })));
      expect(JSON.stringify(after.messages[3]?.parts)).toContain('A fresh answer');
    });
  });

  it('refuses to edit a question that is not the newest one', async () => {
    echo();

    const threadId = await conversation();
    const before = await thread(threadId);
    const calls = model.chats().length;

    expect(
      await chat({ threadId, edit: true, message: said('u1', 'First, reworded') }),
    ).toMatchObject({ status: 409, error: { code: 'ASSISTANT_STALE' } });
    expect((await thread(threadId)).messages).toEqual(before.messages);
    expect(model.chats().length).toBe(calls);
  });

  it('refuses a new question that reuses a message id already in the thread', async () => {
    echo();

    const threadId = await conversation();
    const before = await thread(threadId);

    expect(await chat({ threadId, message: said('u1', 'Asked again') })).toMatchObject({
      status: 409,
      error: { code: 'TAKEN', data: { field: 'message.id' } },
    });
    expect((await thread(threadId)).messages).toEqual(before.messages);
  });

  it("does not let another member edit someone's conversation", async () => {
    echo();

    const threadId = await conversation();

    expect(
      await chat({ threadId, edit: true, message: said('u2', 'Hijacked') }, t.ids.member),
    ).toMatchObject({ status: 404, error: { code: 'NOT_FOUND' } });
    expect(JSON.stringify((await thread(threadId)).messages)).not.toContain('Hijacked');
  });

  it('refuses an edit while a reply is still being written', async () => {
    echo();

    const threadId = await conversation();

    model.script(() => ({
      text: 'one two three four five six seven eight nine ten',
      delayMs: 150,
    }));

    await postChat(
      t.url('/core/v1/assistant/chat'),
      await t.token(),
      { model: 'kimi-k3', threadId, edit: true, message: said('u2', 'Slow one') },
      { stopAfter: (chunk) => chunk.type === 'text-delta' },
    );

    expect(await chat({ threadId, edit: true, message: said('u2', 'Impatient') })).toMatchObject({
      status: 409,
      error: { code: 'ASSISTANT_BUSY' },
    });

    await vi.waitFor(async () => expect((await thread(threadId)).running).toBe(false), {
      timeout: 5000,
    });
    expect(JSON.stringify((await thread(threadId)).messages)).not.toContain('Impatient');
  });

  it('needs an existing conversation to edit', async () => {
    expect(await chat({ edit: true, message: said('u9', 'Nothing to edit') })).toMatchObject({
      status: 400,
      error: { code: 'INVALID_INPUT' },
    });
  });
});

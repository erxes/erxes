import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { fakeModel, lastToolResult, type Script } from './fakeModel';
import { partsOf, postChat, respond, threadIdOf, toolPart, userMessage } from './assistantChat';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0003';

const callThen =
  (procedure: string, input: Record<string, unknown>): Script =>
  (request) =>
    lastToolResult(request) === null
      ? { tool: 'callApi', input: { procedure, input } }
      : { text: 'Done.' };

const searchThen: Script = (request) =>
  lastToolResult(request) === null
    ? { tool: 'searchApi', input: { query: 'audit log' } }
    : { text: 'Found.' };

describe('assistant tools', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const chat = async (body: Record<string, unknown>, user = t.ids.owner) =>
    postChat(t.url('/core/v1/assistant/chat'), await t.token(user), { model: 'kimi-k3', ...body });

  const lastAssistant = async (threadId: string) => {
    const thread = await t.owner().assistant.thread({ id: threadId });
    const message = thread.messages.at(-1);

    return { message, parts: partsOf(message) };
  };

  const tagNames = async () =>
    (await t.owner().tags.list({ type: 'customer' })).data.map((tag) => tag.name);

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
    await t.member().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('runs reads at once and feeds the result back to the model', async () => {
    await t.owner().tags.create({ type: 'customer', name: 'Wholesale' });
    model.script(callThen('tags.list', { type: 'customer' }));

    const reply = await chat({ message: userMessage('Which tags do we have?') });
    const { parts } = await lastAssistant(threadIdOf(reply.chunks));

    expect(toolPart(parts, 'callApi')).toMatchObject({ state: 'output-available' });
    expect(model.lastToolResult()).toContain('Wholesale');
  });

  it('stops a write for approval and runs it only once approved', async () => {
    model.script(callThen('tags.create', { type: 'customer', name: 'VIP' }));

    const reply = await chat({ message: userMessage('Add a VIP tag') });
    const threadId = threadIdOf(reply.chunks);

    expect(reply.chunks.map((chunk) => chunk.type)).toContain('tool-approval-request');
    expect(await tagNames()).not.toContain('VIP');

    const { message, parts } = await lastAssistant(threadId);

    expect(toolPart(parts, 'callApi')).toMatchObject({ state: 'approval-requested' });

    await chat({ threadId, message: { ...message, parts: respond(parts, true) } });

    expect(await tagNames()).toContain('VIP');
    expect(toolPart((await lastAssistant(threadId)).parts, 'callApi')).toMatchObject({
      state: 'output-available',
    });
  });

  it('does not run a write the member turned down', async () => {
    model.script(callThen('tags.create', { type: 'customer', name: 'Rejected' }));

    const reply = await chat({ message: userMessage('Add a Rejected tag') });
    const threadId = threadIdOf(reply.chunks);
    const { message, parts } = await lastAssistant(threadId);

    await chat({ threadId, message: { ...message, parts: respond(parts, false) } });

    expect(await tagNames()).not.toContain('Rejected');
  });

  it('refuses operations on the deny list without asking', async () => {
    model.script(
      callThen('users.setPassword', { id: t.ids.member, password: 'Another-password-1234' }),
    );

    const reply = await chat({ message: userMessage("Reset the member's password") });

    expect(reply.chunks.map((chunk) => chunk.type)).not.toContain('tool-approval-request');
    expect(model.lastToolResult()).toContain('ASSISTANT_DENIED');
  });

  it("refuses what the member's role can't do, and doesn't offer it", async () => {
    model.script(callThen('audit.list', {}));
    await chat({ message: userMessage('Show the audit log') }, t.ids.member);

    expect(model.lastToolResult()).toContain('NOT_ALLOWED');

    model.script(searchThen);
    await chat({ message: userMessage('Find audit') }, t.ids.member);
    expect(model.lastToolResult()).not.toContain('audit.list');

    await chat({ message: userMessage('Find audit') });
    expect(model.lastToolResult()).toContain('audit.list');
  });

  it('asks the member a question and continues with the answer', async () => {
    model.script((request) =>
      lastToolResult(request) === null
        ? { tool: 'ask_user', input: { questions: [{ question: 'Which period?' }] } }
        : { text: 'Thanks.' },
    );

    const reply = await chat({ message: userMessage('Make a report') });
    const threadId = threadIdOf(reply.chunks);
    const { message, parts } = await lastAssistant(threadId);

    const answered = parts.map((part) =>
      part.type === 'tool-ask_user'
        ? { ...part, state: 'output-available', output: { answers: ['Last month'] } }
        : part,
    );

    await chat({ threadId, message: { ...message, parts: answered } });

    expect(model.lastToolResult()).toContain('Last month');
  });
});

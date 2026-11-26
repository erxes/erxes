import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { follow } from './assistantChat';
import { useTestDatabase } from './db';
import { connectProvider, fakeModel } from './fakeModel';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0031';

const TASK = 'A report on customers added in the last 7 days';

describe('automation: ask the assistant', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await connectProvider(t.owner(), KEY);
  });

  afterAll(() => model.close());

  const reportAutomation = async (name: string) => {
    const { id } = await t.owner().automations.create({
      name,
      definition: {
        trigger: { kind: 'manual' },
        steps: [
          { id: 'ask', type: 'action', action: 'core.assistant.ask', input: { prompt: TASK } },
          {
            id: 'tell',
            type: 'action',
            action: 'core.notification.send',
            input: {
              userIds: [t.ids.owner],
              title: name,
              body: '{{steps.ask.output.answer}}',
              link: '{{steps.ask.output.link}}',
            },
          },
        ],
      },
    });

    await t.owner().automations.activate({ id });
    await t.owner().automations.start({ id });
    await settle();

    const [run] = (await t.owner().automations.runs({ id, limit: 10 })).data;

    if (!run) throw new Error('no run started');

    return t.owner().automations.run({ runId: run.id });
  };

  it('runs the task as the member in a chat of theirs, and the next step links to it', async () => {
    model.script(() => ({ text: '12 customers joined this week.' }));

    const { run, steps } = await reportAutomation('Weekly customers');

    expect(run.status).toBe('succeeded');

    const output = steps.find((step) => step.stepId === 'ask')?.output;
    const { threadId } = z.object({ threadId: z.string() }).parse(output);

    expect(output).toEqual({
      answer: '12 customers joined this week.',
      threadId,
      link: `/assistant?thread=${threadId}`,
    });

    await expect(t.owner().assistant.thread({ id: threadId })).resolves.toMatchObject({
      title: 'Weekly customers',
    });
    await expect(t.member().assistant.thread({ id: threadId })).rejects.toMatchObject({
      status: 404,
    });

    const view = await follow(t.owner(), threadId);

    expect(view.entries.find((entry) => entry.kind === 'assistant.user')?.data).toEqual([
      { type: 'data-automation', data: { id: run.automationId, name: 'Weekly customers' } },
      { type: 'text', text: TASK },
    ]);
    expect(JSON.stringify(model.chats().at(-1)?.messages.at(-1))).toContain(
      'nobody is there to answer',
    );

    const inbox = await t
      .owner()
      .notifications.list({ kind: 'core.automation.message', limit: 50 });

    expect(inbox.data.find((item) => item.title === 'Weekly customers')).toMatchObject({
      body: '12 customers joined this week.',
      link: `/assistant?thread=${threadId}`,
    });
  });

  it('fails the run on the first failed answer instead of asking the model again', async () => {
    model.script(() => ({ status: 500, error: 'model is down' }));

    const { run, steps } = await reportAutomation('Broken report');

    expect(run.status).toBe('failed');
    expect(steps.map((step) => step.stepId)).not.toContain('tell');
  });
});

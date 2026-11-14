import type { AutomationDefinition } from '@erxes/core-contract';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { config } from '~/config';
import { postChat, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { fakeModel, inSteps, systemOf } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0012';

const welcome: z.input<typeof AutomationDefinition> = {
  trigger: { kind: 'event', event: 'core.customer.created' },
  steps: [{ id: 'tag', type: 'action', action: 'core.customer.tag', input: { add: ['vip'] } }],
};

describe('assistant built-in skills', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const chat = async (text: string) =>
    postChat(t.url('/core/v1/assistant/chat'), await t.token(), {
      model: 'kimi-k3',
      message: userMessage(text),
    });

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
    await t.owner().assistant.updateSettings({ approvalMode: 'destructive' });
  });

  afterAll(() => model.close());

  it('checks an automation without saving it', async () => {
    expect(await t.owner().automations.check({ definition: welcome })).toEqual({ problems: [] });

    const broken = await t.owner().automations.check({
      definition: {
        ...welcome,
        steps: [{ id: 'x', type: 'action', action: 'nope.do', input: {} }],
      },
    });

    expect(broken.problems).toEqual([expect.stringContaining('nope.do')]);
    expect((await t.owner().automations.list({})).data).toEqual([]);
  });

  it('authors an automation as a draft that stays off', async () => {
    model.script(
      inSteps(
        { tool: 'loadSkill', input: { name: 'author-automation' } },
        {
          tool: 'callApi',
          input: { procedure: 'automations.check', input: { definition: welcome } },
        },
        {
          tool: 'callApi',
          input: {
            procedure: 'automations.create',
            input: { name: 'Tag new customers', definition: welcome },
          },
        },
        { tool: 'callApi', input: { procedure: 'automations.activate', input: { id: 'any' } } },
        { text: 'Saved as a draft.' },
      ),
    );

    await chat('Tag every new customer as vip');

    const [first, skill, checked] = model.chats().slice(-5);

    expect(first ? systemOf(first) : '').toContain('author-automation');
    expect(skill?.messages.at(-1)?.content).toEqual(expect.stringContaining('draft'));
    expect(checked?.messages.at(-1)?.content).toEqual(expect.stringContaining('"problems":[]'));
    expect(model.lastToolResult()).toContain('ASSISTANT_DENIED');

    const { data } = await t.owner().automations.list({});

    expect(data).toEqual([expect.objectContaining({ name: 'Tag new customers', status: 'draft' })]);
  });

  it('keeps report guidance a skill the model loads before writing a report', async () => {
    model.script(
      inSteps({ tool: 'loadSkill', input: { name: 'create-report' } }, { text: 'Done.' }),
    );

    await chat('Build me a sales report');

    const first = model.chats().at(-2);

    expect(first ? systemOf(first) : '').toContain('create-report');
    expect(first ? systemOf(first) : '').not.toContain('KPI row');
    expect(model.lastToolResult()).toContain('KPI row');
  });
});

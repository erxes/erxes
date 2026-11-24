import type { AutomationDefinition } from '@erxes/core-contract';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { config } from '~/config';
import { chat, userMessage } from './assistantChat';
import { field, say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { connectProvider, fakeModel, inSteps, lastToolResult, systemOf } from './fakeModel';
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

  const ask = (text: string) => chat(t.owner(), { model: 'kimi-k3', message: userMessage(text) });

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await connectProvider(t.owner(), KEY);
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

    await ask('Tag every new customer as vip');

    const [first, skill, checked] = model.chats().slice(-5);

    expect(first ? systemOf(first) : '').toContain('author-automation');
    expect(skill ? lastToolResult(skill) : '').toContain('draft');
    expect(checked ? lastToolResult(checked) : '').toContain('"problems":[]');
    expect(model.lastToolResult()).toContain('"DENIED"');

    const { data } = await t.owner().automations.list({});

    expect(data).toEqual([expect.objectContaining({ name: 'Tag new customers', status: 'draft' })]);
  });

  it('drafts a broadcast and refuses to send, test, schedule or start it', async () => {
    const draft = await t.owner().broadcasts.create({ name: 'Spring', channel: 'email' });
    const content = say('Hi ', field('firstName', 'there'));

    const refused = [
      ['broadcasts.send', { id: draft.id }],
      ['broadcasts.test', { id: draft.id, to: ['a@example.com'] }],
      ['broadcasts.schedule', { id: draft.id, at: '2099-01-01T09:00:00Z' }],
      ['broadcasts.resume', { id: draft.id }],
      ['broadcasts.cancel', { id: draft.id }],
      [
        'broadcastSchedules.start',
        { id: draft.id, frequency: 'week', weekdays: [1], at: '09:00', startsOn: '2099-01-01' },
      ],
      ['broadcastSchedules.resume', { id: draft.id }],
    ] as const;

    model.script(
      inSteps(
        { tool: 'loadSkill', input: { name: 'draft-broadcast' } },
        {
          tool: 'callApi',
          input: {
            procedure: 'broadcasts.update',
            input: { id: draft.id, subject: 'Spring sale', content },
          },
        },
        ...refused.map(([procedure, input]) => ({
          tool: 'callApi',
          input: { procedure, input },
        })),
        { text: 'Drafted.' },
      ),
    );

    await ask(`Draft broadcast ${draft.id} for the spring sale and send it`);

    const chats = model.chats().slice(-(refused.length + 3));
    const [first, skill, updated, ...denied] = chats;

    expect(first ? systemOf(first) : '').toContain('draft-broadcast');
    expect(skill ? lastToolResult(skill) : '').toContain('Never send');
    expect(updated ? lastToolResult(updated) : '').toContain('"changed":true');
    expect(
      denied.map(lastToolResult).filter((result) => result?.includes('"DENIED"')),
    ).toHaveLength(refused.length);
    expect(await t.owner().broadcasts.get({ id: draft.id })).toMatchObject({
      status: 'draft',
      subject: 'Spring sale',
      content,
    });
  });

  it('keeps report guidance a skill the model loads before writing a report', async () => {
    model.script(
      inSteps({ tool: 'loadSkill', input: { name: 'create-report' } }, { text: 'Done.' }),
    );

    await ask('Build me a sales report');

    const first = model.chats().at(-2);

    expect(first ? systemOf(first) : '').toContain('create-report');
    expect(first ? systemOf(first) : '').not.toContain('KPI row');
    expect(model.lastToolResult()).toContain('KPI row');
  });
});

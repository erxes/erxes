import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** A payload of `count` answers, keyed `q<number>` from `from` on. */
const answers = (from: number, count: number) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, at) => [`q${String(from + at).padStart(3, '0')}`, 'yes']),
  );

/** A trigger's data that core remembers from the events themselves. */
describe('automation data learned from events', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const triggerOf = async (client: ReturnType<typeof t.owner>, type: string) => {
    const { triggers } = await client.automations.catalog({});

    return triggers.find((item) => item.type === type);
  };

  it('offers what a plugin event carried here, though the plugin lists nothing', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '3.0.0',
      scopes: ['events:write'],
      events: [
        { type: 'hr.chat.received', label: 'Chat received' },
        { type: 'hr.office.opened', label: 'Office opened' },
        {
          type: 'hr.leave.approved',
          label: 'Leave approved',
          fields: [{ key: 'leaveId', label: 'Leave', type: 'text', recordType: 'leave' }],
        },
      ],
    });

    expect(await triggerOf(t.owner(), 'hr.chat.received')).toMatchObject({
      fields: [],
      seen: false,
    });

    await t.hr().events.publish({
      events: [
        {
          type: 'hr.chat.received',
          payload: {
            content: 'Hi',
            unread: 2,
            urgent: false,
            labels: ['new'],
            sender: { id: 'u1' },
            replyTo: null,
            'not a key': 'x',
          },
        },
        { type: 'hr.office.opened' },
        { type: 'hr.leave.approved', payload: { leaveId: 'l1', days: 3 } },
      ],
    });
    await settle();

    expect(await triggerOf(t.owner(), 'hr.chat.received')).toMatchObject({
      seen: true,
      fields: [
        { key: 'content', label: 'Content', type: 'text' },
        { key: 'labels', label: 'Labels', type: 'list' },
        { key: 'unread', label: 'Unread', type: 'number' },
        { key: 'urgent', label: 'Urgent', type: 'boolean' },
      ],
    });
    // Happened, and carried nothing a step can use.
    expect(await triggerOf(t.owner(), 'hr.office.opened')).toMatchObject({
      seen: true,
      fields: [],
    });
    // What the plugin lists keeps its label and record type; what it leaves out is added.
    expect((await triggerOf(t.owner(), 'hr.leave.approved'))?.fields).toEqual([
      { key: 'leaveId', label: 'Leave', type: 'text', recordType: 'leave' },
      { key: 'days', label: 'Days', type: 'number' },
    ]);
    // Another organisation learns only from its own events.
    expect(await triggerOf(t.other(), 'hr.chat.received')).toMatchObject({
      fields: [],
      seen: false,
    });

    await t.hr().events.publish({
      events: [{ type: 'hr.chat.received', payload: { content: 'Again', conversationId: 'c1' } }],
    });
    await settle();
    await t.hr().events.publish({
      events: [{ type: 'hr.chat.received', payload: { content: 'More', reply_to_id: 'm1' } }],
    });
    await settle();

    expect(
      (await triggerOf(t.owner(), 'hr.chat.received'))?.fields.map((field) => field.label),
    ).toEqual(['Content', 'Labels', 'Unread', 'Urgent', 'Conversation id', 'Reply to id']);
  });

  it('stops at fifty keys for one event, however many its payloads bring', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '3.1.0',
      scopes: ['events:write'],
      events: [{ type: 'hr.survey.answered', label: 'Survey answered' }],
    });

    await t.hr().events.publish({
      events: [{ type: 'hr.survey.answered', payload: answers(1, 40) }],
    });
    await settle();
    await t.hr().events.publish({
      events: [{ type: 'hr.survey.answered', payload: answers(41, 40) }],
    });
    await settle();
    await t.hr().events.publish({
      events: [{ type: 'hr.survey.answered', payload: answers(200, 5) }],
    });
    await settle();

    const keys = (await triggerOf(t.owner(), 'hr.survey.answered'))?.fields.map(
      (field) => field.key,
    );

    expect(keys).toHaveLength(50);
    expect(keys?.at(0)).toBe('q001');
    expect(keys?.at(-1)).toBe('q050');
  });
});

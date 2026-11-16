import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** What later steps can insert: a trigger event's values and an earlier action's answer. */
describe('automation data fields', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lists what a plugin event carries and what its action answers', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2.0.0',
      events: [
        {
          type: 'hr.leave.approved',
          label: 'Leave approved',
          fields: [{ key: 'leaveId', label: 'Leave', type: 'text' }],
        },
        { type: 'hr.employee.hired', label: 'Employee hired', subject: 'customer' },
      ],
      actions: [
        {
          type: 'hr.leave.create',
          label: 'Create leave',
          outputs: [{ key: 'days', label: 'Days off', type: 'number' }],
        },
      ],
    });

    const { triggers, actions } = await t.owner().automations.catalog({});
    const fieldsOf = (type: string) => triggers.find((item) => item.type === type)?.fields;
    const outputsOf = (type: string) => actions.find((item) => item.type === type)?.outputs;

    expect(fieldsOf('hr.leave.approved')).toEqual([
      { key: 'leaveId', label: 'Leave', type: 'text' },
    ]);
    expect(fieldsOf('hr.employee.hired')).toEqual([]);
    expect(fieldsOf('core.customer.created')).toEqual([]);
    expect(outputsOf('hr.leave.create')).toEqual([
      { key: 'days', label: 'Days off', type: 'number' },
    ]);
    // Core's own actions say what they answer too.
    expect(outputsOf('core.webhook.post')).toContainEqual({
      key: 'status',
      label: 'Response status',
      type: 'number',
    });
    expect(outputsOf('core.note.add')).toEqual([]);

    // A key a placeholder can't name is refused.
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '2.0.1',
        actions: [
          {
            type: 'hr.leave.create',
            label: 'Create leave',
            outputs: [{ key: 'days off', label: 'Days off', type: 'number' }],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});

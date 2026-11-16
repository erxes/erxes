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

  it("names a trigger's record, offers its record ids to pickers, and warns the plugin of gaps", async () => {
    const { warnings } = await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2.1.0',
      events: [
        {
          type: 'hr.leave.approved',
          label: 'Leave approved',
          record: 'Leave',
          fields: [
            { key: 'leaveId', label: 'Leave', type: 'text', recordType: 'leave' },
            { key: 'customerId', label: 'Employee', type: 'text' },
          ],
        },
        { type: 'hr.leave.cancelled', label: 'Leave cancelled', subject: 'customer' },
      ],
      actions: [
        {
          type: 'hr.leave.extend',
          label: 'Extend a leave',
          fields: [
            { key: 'leaveId', label: 'Leave', type: 'plugin_record', recordType: 'leave' },
            {
              key: 'approverIds',
              label: 'Approvers',
              type: 'plugin_record',
              recordType: 'approver',
              multiple: true,
            },
            { key: 'teamId', label: 'Team', type: 'text' },
          ],
        },
      ],
    });

    const { triggers, actions } = await t.owner().automations.catalog({});
    const trigger = (type: string) => triggers.find((item) => item.type === type);

    expect(trigger('hr.leave.approved')).toMatchObject({
      record: 'Leave',
      fields: [
        { key: 'leaveId', label: 'Leave', type: 'text', recordType: 'leave' },
        { key: 'customerId', label: 'Employee', type: 'text' },
      ],
    });
    // Core's invoice events say what they carry, like a plugin's.
    expect(trigger('core.payment.paid')).toMatchObject({ record: 'Invoice', subject: null });
    expect(trigger('core.payment.paid')?.fields).toContainEqual({
      key: 'paidAmount',
      label: 'Paid amount',
      type: 'number',
    });
    expect(actions.find((item) => item.type === 'hr.leave.extend')?.fields[1]).toMatchObject({
      multiple: true,
      recordType: 'approver',
    });

    // The plugin hears what members would miss: an event with no data and an id typed as text.
    // A customer's id is core's, so it needs no record type.
    expect(warnings).toEqual([
      expect.stringMatching(/^Event hr\.leave\.cancelled declares no fields/),
      expect.stringMatching(/^Action hr\.leave\.extend input teamId takes a typed id/),
    ]);

    // Only a record picker takes several records.
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '2.1.1',
        actions: [
          {
            type: 'hr.leave.extend',
            label: 'Extend a leave',
            fields: [{ key: 'note', label: 'Note', type: 'text', multiple: true }],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    // A list of records can't narrow another picker: there is no one parent to list under.
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '2.1.2',
        actions: [
          {
            type: 'hr.leave.extend',
            label: 'Extend a leave',
            fields: [
              {
                key: 'teamIds',
                label: 'Teams',
                type: 'plugin_record',
                recordType: 'team',
                multiple: true,
              },
              {
                key: 'memberId',
                label: 'Member',
                type: 'plugin_record',
                recordType: 'member',
                dependsOn: 'teamIds',
              },
            ],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});

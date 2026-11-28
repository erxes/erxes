import type { DataExtensionValuesInput } from '@erxes/core-contract';
import type { z } from 'zod';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('Data Extensions: value history, field access and conditional rules', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Deals with a stage, a value only admins see and a margin worked out from it. */
  const setUp = async () => {
    const owner = t.owner();

    await owner.dataObjects.create({ key: 'deal', singularLabel: 'Deal', pluralLabel: 'Deals' });
    await owner.dataFields.create({
      recordType: 'custom.deal',
      key: 'stage',
      label: 'Stage',
      type: 'select',
      options: [
        { value: 'open', label: 'Open', color: 'blue' },
        { value: 'lost', label: 'Lost', color: 'red' },
      ],
    });
    await owner.dataFields.create({
      recordType: 'custom.deal',
      key: 'cost',
      label: 'Cost',
      type: 'number',
      settings: { visibleTo: ['admin'] },
    });
    await owner.dataFields.create({
      recordType: 'custom.deal',
      key: 'margin',
      label: 'Margin',
      type: 'formula',
      settings: { formula: { expression: '100 - COALESCE({cost}, 0)' } },
    });

    return owner.dataFields.create({
      recordType: 'custom.deal',
      key: 'reason',
      label: 'Lost reason',
      type: 'text',
      settings: {
        editableBy: ['admin'],
        requiredWhen: { field: 'stage', operator: 'eq', value: 'lost' },
      },
    });
  };

  it('keeps each change to a record’s values, who made it and what it was', async () => {
    await setUp();

    const owner = t.owner();

    const deal = await owner.dataRecords.create({
      objectKey: 'deal',
      values: { name: 'Bank', stage: 'open', cost: 40 },
    });

    await owner.dataRecords.update({ objectKey: 'deal', id: deal.id, values: { cost: 55 } });
    // Writing the same value again isn't a change.
    await owner.dataRecords.update({ objectKey: 'deal', id: deal.id, values: { cost: 55 } });

    const { data } = await owner.dataChanges.history({
      recordType: 'custom.deal',
      recordId: deal.id,
    });

    expect(data).toMatchObject([
      {
        kind: 'updated',
        actorType: 'user',
        actorId: t.ids.owner,
        actorName: 'owner@acme.mn',
        changes: [{ key: 'cost', label: 'Cost', type: 'number', from: 40, to: 55 }],
      },
      {
        kind: 'created',
        changes: [
          { key: 'name', from: null, to: 'Bank' },
          { key: 'stage', from: null, to: 'open' },
          { key: 'cost', from: null, to: 40 },
        ],
      },
    ]);

    // A member doesn't see the cost, nor the margin that would give it away.
    const seen = await t.member().dataRecords.get({ objectKey: 'deal', id: deal.id });

    expect(seen.values).toEqual({ name: 'Bank', stage: 'open', reason: null });
    expect(
      (await t.member().dataChanges.history({ recordType: 'custom.deal', recordId: deal.id })).data,
    ).toMatchObject([
      { kind: 'updated', changes: [] },
      { changes: [{ key: 'name' }, { key: 'stage' }] },
    ]);
    expect((await owner.dataRecords.get({ objectKey: 'deal', id: deal.id })).values).toMatchObject({
      cost: 55,
      margin: 45,
    });
    await expect(
      t.member().dataRecords.list({ objectKey: 'deal', sortField: 'cost' }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });
    await expect(
      t.other().dataChanges.history({ recordType: 'custom.deal', recordId: deal.id }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    // Its own deals don't include this one.
    await t
      .other()
      .dataObjects.create({ key: 'deal', singularLabel: 'Deal', pluralLabel: 'Deals' });
    await expect(
      t.other().dataChanges.history({ recordType: 'custom.deal', recordId: deal.id }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'recordId' } });
  });

  it('stops a member writing a field their role can’t change, or leaving a required one blank', async () => {
    const owner = t.owner();
    const deal = await owner.dataRecords.create({ objectKey: 'deal', values: { stage: 'open' } });

    const update = (values: z.input<typeof DataExtensionValuesInput>, client = owner) =>
      client.dataRecords.update({ objectKey: 'deal', id: deal.id, values });

    await expect(update({ stage: 'lost' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['values', 'reason'] }] },
    });
    await expect(update({ stage: 'lost', reason: 'Price' })).resolves.toMatchObject({
      values: { stage: 'lost', reason: 'Price' },
    });
    await expect(update({ reason: 'Timing' }, t.member())).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });
    await expect(update({ cost: 1 }, t.member())).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    await expect(update({ name: 'Renamed' }, t.member())).resolves.toMatchObject({
      values: { name: 'Renamed', reason: 'Price' },
    });
  });

  it('checks the roles and fields a rule names, and follows a renamed field', async () => {
    const owner = t.owner();

    const { data } = await owner.dataFields.list({ recordType: 'custom.deal' });
    const id = (key: string) => data.find((field) => field.key === key)?.id ?? '';

    await expect(
      owner.dataFields.update({ id: id('cost'), settings: { visibleTo: ['r_nosuchrole'] } }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    await expect(
      owner.dataFields.update({
        id: id('cost'),
        settings: { visibleTo: ['admin'], requiredWhen: { field: 'nope', operator: 'isNotEmpty' } },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await owner.dataFields.update({ id: id('stage'), key: 'phase' });

    const reason = await owner.dataFields.list({ recordType: 'custom.deal' });

    expect(reason.data.find((field) => field.key === 'reason')?.settings.requiredWhen).toEqual({
      field: 'phase',
      operator: 'eq',
      value: 'lost',
    });
  });

  it('puts a customer’s value changes on its timeline, less what the member can’t see', async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'tier',
      label: 'Tier',
      type: 'text',
    });
    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'credit',
      label: 'Credit',
      type: 'number',
      settings: { visibleTo: ['admin'] },
    });

    const customer = await owner.customers.create({ firstName: 'Anu', primaryEmail: 'a@mail.mn' });

    await owner.dataValues.update({
      recordType: 'core.customer',
      recordId: customer.id,
      values: { tier: 'gold', credit: 900 },
    });

    const timeline = async (client: ReturnType<typeof t.owner>) =>
      (await client.activities.list({ targetType: 'customer', targetId: customer.id })).data.find(
        (entry) => entry.type === 'data.values.changed',
      )?.data;

    expect(await timeline(owner)).toMatchObject({
      changes: [
        { key: 'tier', to: 'gold' },
        { key: 'credit', to: 900 },
      ],
    });
    expect(await timeline(t.member())).toEqual({
      changes: [expect.objectContaining({ key: 'tier', to: 'gold' })],
    });
  });
});

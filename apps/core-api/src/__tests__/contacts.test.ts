import { describe, expect, it } from 'vite-plus/test';
import { describeWithDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Tags and custom fields on contacts. Companies and merging: `companies.test.ts`. */
describeWithDb('tags and custom fields', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const tag = async (type: 'customer' | 'company', name: string) =>
    (await t.owner().tags.create({ type, name, colorCode: '#22aa66' })).id;

  const tagsOf = async (id: string) => (await t.owner().customers.get({ id })).tagIds;

  describe('tags', () => {
    it('creates tags per type with unique names and lists them by name', async () => {
      await tag('customer', 'VIP');
      await tag('customer', 'cold');
      await tag('company', 'VIP');

      await expect(t.member().tags.create({ type: 'customer', name: 'vip' })).rejects.toMatchObject(
        { status: 409, code: 'TAG_EXISTS' },
      );
      expect(
        (await t.member().tags.list({ type: 'customer' })).data.map((item) => item.name),
      ).toEqual(['cold', 'VIP']);
      expect((await t.other().tags.list({ type: 'customer' })).data).toEqual([]);
    });

    it('tags customers with their own type only and takes deleted tags off', async () => {
      const gold = await tag('customer', 'Gold');
      const partner = await tag('company', 'Partner');
      const created = await t.owner().customers.create({ firstName: 'Tagged', tagIds: [gold] });

      expect(created.tagIds).toEqual([gold]);
      await expect(
        t.owner().customers.update({ id: created.id, tagIds: [partner] }),
      ).rejects.toMatchObject({ code: 'INVALID_TAG' });
      expect(
        (await t.owner().customers.list({ tagIds: gold })).data.map((item) => item.id),
      ).toEqual([created.id]);

      await expect(t.member().tags.remove({ id: gold })).rejects.toMatchObject({ status: 403 });
      await t.owner().tags.remove({ id: gold });
      expect(await tagsOf(created.id)).toEqual([]);
    });

    it('adds and removes tags on many customers at once', async () => {
      const a = await tag('customer', 'A');
      const b = await tag('customer', 'B');
      const one = await t.owner().customers.create({ firstName: 'One', tagIds: [a] });
      const two = await t.owner().customers.create({ firstName: 'Two' });

      expect(
        await t.owner().customers.tag({ ids: [one.id, two.id], add: [b], remove: [a] }),
      ).toMatchObject({ updated: 2 });
      expect(await tagsOf(one.id)).toEqual([b]);
      expect(await tagsOf(two.id)).toEqual([b]);
    });
  });

  describe('custom fields', () => {
    it('only owners and admins define fields; values are checked against them', async () => {
      await expect(
        t.member().fields.create({ contentType: 'customer', label: 'Tier', type: 'text' }),
      ).rejects.toMatchObject({ status: 403 });

      const tier = await t.owner().fields.create({
        contentType: 'customer',
        label: 'Tier',
        type: 'select',
        options: ['Bronze', 'Silver'],
      });

      const visits = await t
        .owner()
        .fields.create({ contentType: 'customer', label: 'Visits', type: 'number' });

      const created = await t.member().customers.create({
        firstName: 'Custom',
        customFields: { [tier.id]: 'Silver', [visits.id]: 3 },
      });

      const { id } = created;

      expect(created.customFields).toEqual({ [tier.id]: 'Silver', [visits.id]: 3 });
      await expect(
        t.member().customers.update({ id, customFields: { [tier.id]: 'Platinum' } }),
      ).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_FIELD_VALUE',
        data: { fieldId: tier.id },
      });
      expect(
        (await t.member().customers.update({ id, customFields: { [visits.id]: null } }))
          .customFields,
      ).toEqual({ [tier.id]: 'Silver' });
      expect(
        (await t.member().fields.list({ contentType: 'customer' })).data.map((field) => field.id),
      ).toEqual([tier.id, visits.id]);

      await t.owner().fields.remove({ id: tier.id });
      expect((await t.owner().customers.get({ id })).customFields).toEqual({});
    });

    it('rejects fields of another record type', async () => {
      const region = await t
        .owner()
        .fields.create({ contentType: 'company', label: 'Region', type: 'text' });

      await expect(
        t.owner().customers.create({ firstName: 'X', customFields: { [region.id]: 'North' } }),
      ).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    });
  });
});

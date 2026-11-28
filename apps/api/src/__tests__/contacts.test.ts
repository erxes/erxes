import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Tags and custom fields on contacts. Companies and merging: `companies.test.ts`. */
describe('tags and custom fields', () => {
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
        { status: 409, code: 'TAKEN' },
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

  describe('data fields', () => {
    it('only owners and admins define fields; values are checked against them', async () => {
      await expect(
        t.member().dataFields.create({
          recordType: 'core.customer',
          key: 'tier',
          label: 'Tier',
          type: 'text',
        }),
      ).rejects.toMatchObject({ status: 403 });

      const tier = await t.owner().dataFields.create({
        recordType: 'core.customer',
        key: 'tier',
        label: 'Tier',
        type: 'select',
        options: [
          { value: 'Bronze', label: 'Bronze', color: 'orange' },
          { value: 'Silver', label: 'Silver', color: 'gray' },
        ],
      });

      const visits = await t.owner().dataFields.create({
        recordType: 'core.customer',
        key: 'visits',
        label: 'Visits',
        type: 'number',
      });

      const created = await t.member().customers.create({
        firstName: 'Custom',
        values: { tier: 'Silver', visits: 3 },
      });

      const { id } = created;

      expect(created.values).toEqual({ tier: 'Silver', visits: 3 });
      await expect(
        t.member().customers.update({ id, values: { tier: 'Platinum' } }),
      ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
      expect((await t.member().customers.update({ id, values: { visits: null } })).values).toEqual({
        tier: 'Silver',
        visits: null,
      });
      expect(
        (await t.member().dataFields.list({ recordType: 'core.customer' })).data.map(
          (field) => field.id,
        ),
      ).toEqual([tier.id, visits.id]);

      await t.owner().dataFields.archive({ id: tier.id });
      await t.owner().dataFields.remove({ id: tier.id });
      expect((await t.owner().customers.get({ id })).values).toEqual({ visits: null });
    });

    it('rejects fields of another record type', async () => {
      await t.owner().dataFields.create({
        recordType: 'core.company',
        key: 'region',
        label: 'Region',
        type: 'text',
      });

      await expect(
        t.owner().customers.create({ firstName: 'X', values: { region: 'North' } }),
      ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    });

    it('asks for a required field only while it shows', async () => {
      const owner = t.owner();

      await owner.dataFields.create({
        recordType: 'core.customer',
        key: 'kind',
        label: 'Kind',
        type: 'select',
        options: [
          { value: 'person', label: 'Person', color: 'gray' },
          { value: 'reseller', label: 'Reseller', color: 'blue' },
        ],
      });
      await owner.dataFields.create({
        recordType: 'core.customer',
        key: 'resellerCode',
        label: 'Reseller code',
        type: 'text',
        settings: {
          required: true,
          visibleWhen: { field: 'kind', operator: 'eq', value: 'reseller' },
        },
      });

      // Hidden while the customer is a person: it may stay empty.
      const person = await owner.customers.create({
        firstName: 'Person',
        values: { kind: 'person', resellerCode: null },
      });

      await expect(
        owner.customers.update({ id: person.id, values: { kind: 'reseller', resellerCode: null } }),
      ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
      expect(
        (
          await owner.customers.update({
            id: person.id,
            values: { kind: 'reseller', resellerCode: 'R-1' },
          })
        ).values,
      ).toMatchObject({ kind: 'reseller', resellerCode: 'R-1' });
    });
  });
});

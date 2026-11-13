import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const idsOf = (page: { data: { id: string }[] }) => page.data.map((item) => item.id);

/** Companies, links between customers and companies, and merging records. */
describe('companies and merge', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  describe('companies', () => {
    it('creates companies with unique names and searches them', async () => {
      const created = await t.member().companies.create({
        primaryName: 'Nomad Tech',
        names: ['Nomad LLC'],
        website: 'nomad.mn',
        size: 40,
      });

      expect(created).toMatchObject({
        primaryName: 'Nomad Tech',
        names: ['Nomad Tech', 'Nomad LLC'],
      });
      await expect(
        t.member().companies.create({ primaryName: 'nomad tech' }),
      ).rejects.toMatchObject({ status: 409, code: 'COMPANY_EXISTS', data: { id: created.id } });
      expect(idsOf(await t.member().companies.list({ search: 'llc' }))).toEqual([created.id]);
      await expect(t.other().companies.get({ id: created.id })).rejects.toMatchObject({
        status: 404,
      });
    });

    it('links customers and companies both ways', async () => {
      const company = await t.owner().companies.create({ primaryName: 'Steppe Foods' });
      const customer = await t.owner().customers.create({ firstName: 'Linked' });
      const link = { id: customer.id, companyId: company.id };

      // Linking twice is fine.
      await t.owner().customers.linkCompany(link);
      await t.owner().customers.linkCompany(link);
      expect(
        (await t.owner().customers.companies({ id: customer.id })).data.map(
          (item) => item.primaryName,
        ),
      ).toEqual(['Steppe Foods']);
      expect(idsOf(await t.owner().customers.list({ companyId: company.id }))).toEqual([
        customer.id,
      ]);
      expect(idsOf(await t.owner().companies.list({ customerId: customer.id }))).toEqual([
        company.id,
      ]);

      await t.owner().customers.unlinkCompany(link);
      expect((await t.owner().customers.companies({ id: customer.id })).data).toEqual([]);
      await expect(t.other().customers.linkCompany(link)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('merge', () => {
    it('merges customers: fills empty fields, combines contacts, tags and companies', async () => {
      const tag = (name: string) =>
        t.owner().tags.create({ type: 'customer', name, colorCode: '#22aa66' });

      const [m1, m2] = [(await tag('M1')).id, (await tag('M2')).id];
      const company = await t.owner().companies.create({ primaryName: 'Merge Co' });

      const keep = await t.owner().customers.create({
        state: 'lead',
        firstName: 'Bat',
        primaryEmail: 'bat@a.mn',
        tagIds: [m1],
      });

      const other = await t.owner().customers.create({
        firstName: 'Batbold',
        lastName: 'Dorj',
        position: 'CEO',
        primaryEmail: 'bat@b.mn',
        phones: ['99112233'],
        tagIds: [m2],
      });

      const merge = { ids: [keep.id, other.id], keepId: keep.id };

      await t.owner().customers.linkCompany({ id: other.id, companyId: company.id });
      await expect(t.member().customers.merge(merge)).rejects.toMatchObject({ status: 403 });
      expect(await t.owner().customers.merge(merge)).toMatchObject({
        id: keep.id,
        state: 'customer',
        firstName: 'Bat',
        lastName: 'Dorj',
        position: 'CEO',
        primaryEmail: 'bat@a.mn',
        emails: ['bat@a.mn', 'bat@b.mn'],
        phones: ['99112233'],
        tagIds: [m1, m2],
      });

      // The merged id resolves to the kept customer; its company came along.
      expect((await t.owner().customers.get({ id: other.id })).id).toBe(keep.id);
      expect(idsOf(await t.owner().customers.companies({ id: keep.id }))).toEqual([company.id]);
      // The other's primary email is taken by the kept customer only.
      await expect(t.owner().customers.create({ primaryEmail: 'bat@a.mn' })).rejects.toMatchObject({
        data: { id: keep.id },
      });
    });

    it('merges companies and keeps the other names', async () => {
      const keep = await t.owner().companies.create({ primaryName: 'Gobi', website: null });

      const other = await t
        .owner()
        .companies.create({ primaryName: 'Gobi Cashmere', website: 'gobi.mn' });

      expect(
        await t.owner().companies.merge({ ids: [keep.id, other.id], keepId: keep.id }),
      ).toMatchObject({ primaryName: 'Gobi', names: ['Gobi', 'Gobi Cashmere'] });
      expect((await t.owner().companies.get({ id: other.id })).id).toBe(keep.id);
    });

    it('refuses to merge records of another organisation', async () => {
      const mine = await t.owner().customers.create({ firstName: 'Mine' });
      const theirs = await t.other().customers.create({ firstName: 'Theirs' });

      await expect(
        t.owner().customers.merge({ ids: [mine.id, theirs.id], keepId: mine.id }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});

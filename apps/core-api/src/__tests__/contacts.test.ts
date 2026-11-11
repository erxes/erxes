import type { ContentType } from '@erxes/core-contract';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase, useTestServer } from './support';

describeWithDb('tags, custom fields, companies and merge', () => {
  useTestDatabase();

  const server = useTestServer();
  let owner = server.client();
  let member = server.client();
  let otherOrg = server.client();

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    const memberId = newId();

    await db().insert(users).values({
      id: memberId,
      orgId: acme.organization.id,
      email: 'member@acme.mn',
      status: 'active',
    });

    owner = server.client(signAccessToken(acme.owner.id, acme.organization.id));
    member = server.client(signAccessToken(memberId, acme.organization.id));
    otherOrg = server.client(signAccessToken(globex.owner.id, globex.organization.id));
  });

  const tag = async (type: ContentType, name: string) =>
    (await owner.tags.create({ type, name, colorCode: '#22aa66' })).id;

  describe('tags', () => {
    it('creates tags per type with unique names and lists them by name', async () => {
      await tag('customer', 'VIP');
      await tag('customer', 'cold');
      await tag('company', 'VIP');

      await expect(member.tags.create({ type: 'customer', name: 'vip' })).rejects.toMatchObject({
        status: 409,
        code: 'TAG_EXISTS',
      });

      const list = await member.tags.list({ type: 'customer' });

      expect(list.data.map((item) => item.name)).toEqual(['cold', 'VIP']);
      expect((await otherOrg.tags.list({ type: 'customer' })).data).toEqual([]);
    });

    it('tags customers with their own type only and takes deleted tags off', async () => {
      const vip = await tag('customer', 'Gold');
      const companyTag = await tag('company', 'Partner');
      const created = await owner.customers.create({ firstName: 'Tagged', tagIds: [vip] });
      const filtered = await owner.customers.list({ tagIds: vip });

      expect(created.tagIds).toEqual([vip]);
      await expect(
        owner.customers.update({ id: created.id, tagIds: [companyTag] }),
      ).rejects.toMatchObject({ code: 'INVALID_TAG' });
      expect(filtered.data.map((item) => item.id)).toEqual([created.id]);

      await expect(member.tags.remove({ id: vip })).rejects.toMatchObject({ status: 403 });
      expect(await owner.tags.remove({ id: vip })).toEqual({ ok: true });
      expect(server.status()).toBe(200);
      expect((await owner.customers.get({ id: created.id })).tagIds).toEqual([]);
    });

    it('adds and removes tags on many customers at once', async () => {
      const a = await tag('customer', 'A');
      const b = await tag('customer', 'B');
      const one = await owner.customers.create({ firstName: 'One', tagIds: [a] });
      const two = await owner.customers.create({ firstName: 'Two' });

      const result = await owner.customers.tag({
        ids: [one.id, two.id],
        add: [b],
        remove: [a],
      });

      expect(result.updated).toBe(2);
      expect((await owner.customers.get({ id: one.id })).tagIds).toEqual([b]);
      expect((await owner.customers.get({ id: two.id })).tagIds).toEqual([b]);
    });
  });

  describe('custom fields', () => {
    it('only owners and admins define fields; values are checked against them', async () => {
      await expect(
        member.fields.create({ contentType: 'customer', label: 'Tier', type: 'text' }),
      ).rejects.toMatchObject({ status: 403 });

      const tier = await owner.fields.create({
        contentType: 'customer',
        label: 'Tier',
        type: 'select',
        options: ['Bronze', 'Silver'],
      });

      const visits = await owner.fields.create({
        contentType: 'customer',
        label: 'Visits',
        type: 'number',
      });

      const created = await member.customers.create({
        firstName: 'Custom',
        customFields: { [tier.id]: 'Silver', [visits.id]: 3 },
      });

      await expect(
        member.customers.update({ id: created.id, customFields: { [tier.id]: 'Platinum' } }),
      ).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_FIELD_VALUE',
        data: { fieldId: tier.id },
      });

      const cleared = await member.customers.update({
        id: created.id,
        customFields: { [visits.id]: null },
      });

      expect(created.customFields).toEqual({ [tier.id]: 'Silver', [visits.id]: 3 });
      expect(cleared.customFields).toEqual({ [tier.id]: 'Silver' });

      const fields = await member.fields.list({ contentType: 'customer' });
      expect(fields.data.map((field) => field.id)).toEqual([tier.id, visits.id]);

      await owner.fields.remove({ id: tier.id });
      expect((await owner.customers.get({ id: created.id })).customFields).toEqual({});
    });

    it('rejects fields of another record type', async () => {
      const companyField = await owner.fields.create({
        contentType: 'company',
        label: 'Region',
        type: 'text',
      });

      await expect(
        owner.customers.create({ firstName: 'X', customFields: { [companyField.id]: 'North' } }),
      ).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    });
  });

  describe('companies', () => {
    it('creates companies with unique names and searches them', async () => {
      const created = await member.companies.create({
        primaryName: 'Nomad Tech',
        names: ['Nomad LLC'],
        website: 'nomad.mn',
        size: 40,
      });

      await expect(member.companies.create({ primaryName: 'nomad tech' })).rejects.toMatchObject({
        status: 409,
        code: 'COMPANY_EXISTS',
        data: { id: created.id },
      });

      const search = await member.companies.list({ search: 'llc' });

      expect(created).toMatchObject({
        primaryName: 'Nomad Tech',
        names: ['Nomad Tech', 'Nomad LLC'],
      });
      expect(search.data.map((item) => item.id)).toEqual([created.id]);
      await expect(otherOrg.companies.get({ id: created.id })).rejects.toMatchObject({
        status: 404,
      });
    });

    it('links customers and companies both ways', async () => {
      const company = await owner.companies.create({ primaryName: 'Steppe Foods' });
      const customer = await owner.customers.create({ firstName: 'Linked' });
      const link = { id: customer.id, companyId: company.id };

      expect(await owner.customers.linkCompany(link)).toEqual({ ok: true });
      expect(server.status()).toBe(200);
      // Linking again is not an error.
      expect(await owner.customers.linkCompany(link)).toEqual({ ok: true });
      expect(server.status()).toBe(200);

      const ofCustomer = await owner.customers.companies({ id: customer.id });
      const ofCompany = await owner.customers.list({ companyId: company.id });
      const companiesOf = await owner.companies.list({ customerId: customer.id });

      expect(ofCustomer.data.map((item) => item.primaryName)).toEqual(['Steppe Foods']);
      expect(ofCompany.data.map((item) => item.id)).toEqual([customer.id]);
      expect(companiesOf.data.map((item) => item.id)).toEqual([company.id]);

      await owner.customers.unlinkCompany(link);
      expect((await owner.customers.companies({ id: customer.id })).data).toEqual([]);
      await expect(otherOrg.customers.linkCompany(link)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('merge', () => {
    it('merges customers: fills empty fields, combines contacts, tags and companies', async () => {
      const t1 = await tag('customer', 'M1');
      const t2 = await tag('customer', 'M2');
      const company = await owner.companies.create({ primaryName: 'Merge Co' });

      const keep = await owner.customers.create({
        state: 'lead',
        firstName: 'Bat',
        primaryEmail: 'bat@a.mn',
        tagIds: [t1],
      });

      const other = await owner.customers.create({
        firstName: 'Batbold',
        lastName: 'Dorj',
        position: 'CEO',
        primaryEmail: 'bat@b.mn',
        phones: ['99112233'],
        tagIds: [t2],
      });

      await owner.customers.linkCompany({ id: other.id, companyId: company.id });

      const merge = { ids: [keep.id, other.id], keepId: keep.id };

      await expect(member.customers.merge(merge)).rejects.toMatchObject({ status: 403 });

      const merged = await owner.customers.merge(merge);

      expect(server.status()).toBe(200);
      expect(merged).toMatchObject({
        id: keep.id,
        state: 'customer',
        firstName: 'Bat',
        lastName: 'Dorj',
        position: 'CEO',
        primaryEmail: 'bat@a.mn',
        emails: ['bat@a.mn', 'bat@b.mn'],
        phones: ['99112233'],
        tagIds: [t1, t2],
      });

      // The merged id resolves to the kept customer; its company came along.
      expect((await owner.customers.get({ id: other.id })).id).toBe(keep.id);
      const ofKept = await owner.customers.companies({ id: keep.id });
      expect(ofKept.data.map((item) => item.id)).toEqual([company.id]);
      // The other's primary email is free again for the kept customer only.
      await expect(owner.customers.create({ primaryEmail: 'bat@a.mn' })).rejects.toMatchObject({
        data: { id: keep.id },
      });
    });

    it('merges companies and keeps the other names', async () => {
      const keep = await owner.companies.create({ primaryName: 'Gobi', website: null });

      const other = await owner.companies.create({
        primaryName: 'Gobi Cashmere',
        website: 'gobi.mn',
      });

      const merged = await owner.companies.merge({ ids: [keep.id, other.id], keepId: keep.id });

      expect(merged).toMatchObject({ primaryName: 'Gobi', names: ['Gobi', 'Gobi Cashmere'] });
      expect((await owner.companies.get({ id: other.id })).id).toBe(keep.id);
    });

    it('refuses to merge records of another organisation', async () => {
      const mine = await owner.customers.create({ firstName: 'Mine' });
      const theirs = await otherOrg.customers.create({ firstName: 'Theirs' });

      await expect(
        owner.customers.merge({ ids: [mine.id, theirs.id], keepId: mine.id }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});

import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';

describeWithDb('tags, custom fields, companies and merge', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let ownerToken = '';
  let memberToken = '';
  let otherOrgToken = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'owner@acme.mn' } });
    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });
    const memberId = newId();

    await adminDb().insert(users).values({
      id: memberId,
      orgId: acme.organization.id,
      email: 'member@acme.mn',
      status: 'active',
    });

    ownerToken = signAccessToken(acme.owner.id, acme.organization.id);
    memberToken = signAccessToken(memberId, acme.organization.id);
    otherOrgToken = signAccessToken(globex.owner.id, globex.organization.id);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  /** Every field a test reads from a response (success or error). */
  interface Body {
    id: string;
    name: string;
    primaryName: string;
    names: string[];
    firstName: string | null;
    lastName: string | null;
    position: string | null;
    primaryEmail: string | null;
    emails: string[];
    phones: string[];
    tagIds: string[];
    customFields: Record<string, unknown>;
    state: string;
    data: { id: string; primaryName?: string; name?: string; firstName?: string | null }[];
    totalCount: number;
    updated: number;
    code: string;
  }

  /** `data` of an error body (oRPC: `{ code, status, message, data }`). */
  const errorData = (body: unknown) => (body as { data?: { id?: string | null; fieldId?: string } }).data;

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: (await response.json()) as Body };
  };

  const tag = async (type: string, name: string) =>
    (await call(ownerToken, 'POST', '/tags', { type, name, colorCode: '#22aa66' })).body.id;

  describe('tags', () => {
    it('creates tags per type with unique names and lists them by name', async () => {
      await tag('customer', 'VIP');
      await tag('customer', 'cold');
      await tag('company', 'VIP');

      const duplicate = await call(memberToken, 'POST', '/tags', { type: 'customer', name: 'vip' });
      const list = await call(memberToken, 'GET', '/tags?type=customer');

      expect(duplicate.status).toBe(409);
      expect(duplicate.body.code).toBe('TAG_EXISTS');
      expect(list.body.data.map((item) => item.name)).toEqual(['cold', 'VIP']);
      expect((await call(otherOrgToken, 'GET', '/tags?type=customer')).body.data).toEqual([]);
    });

    it('tags customers with their own type only and takes deleted tags off', async () => {
      const vip = await tag('customer', 'Gold');
      const companyTag = await tag('company', 'Partner');
      const created = await call(ownerToken, 'POST', '/customers', { firstName: 'Tagged', tagIds: [vip] });
      const wrongType = await call(ownerToken, 'PATCH', `/customers/${created.body.id}`, { tagIds: [companyTag] });
      const filtered = await call(ownerToken, 'GET', `/customers?tagIds=${vip}`);

      expect(created.body.tagIds).toEqual([vip]);
      expect(wrongType.body.code).toBe('INVALID_TAG');
      expect(filtered.body.data.map((item) => item.id)).toEqual([created.body.id]);

      expect((await call(memberToken, 'DELETE', `/tags/${vip}`, {})).status).toBe(403);
      expect((await call(ownerToken, 'DELETE', `/tags/${vip}`, {})).status).toBe(200);
      expect((await call(ownerToken, 'GET', `/customers/${created.body.id}`)).body.tagIds).toEqual([]);
    });

    it('adds and removes tags on many customers at once', async () => {
      const a = await tag('customer', 'A');
      const b = await tag('customer', 'B');
      const one = await call(ownerToken, 'POST', '/customers', { firstName: 'One', tagIds: [a] });
      const two = await call(ownerToken, 'POST', '/customers', { firstName: 'Two' });
      const result = await call(ownerToken, 'POST', '/customers/tag', {
        ids: [one.body.id, two.body.id],
        add: [b],
        remove: [a],
      });

      expect(result.body.updated).toBe(2);
      expect((await call(ownerToken, 'GET', `/customers/${one.body.id}`)).body.tagIds).toEqual([b]);
      expect((await call(ownerToken, 'GET', `/customers/${two.body.id}`)).body.tagIds).toEqual([b]);
    });
  });

  describe('custom fields', () => {
    it('only owners and admins define fields; values are checked against them', async () => {
      expect(
        (await call(memberToken, 'POST', '/fields', { contentType: 'customer', label: 'Tier', type: 'text' })).status,
      ).toBe(403);

      const tier = await call(ownerToken, 'POST', '/fields', {
        contentType: 'customer',
        label: 'Tier',
        type: 'select',
        options: ['Bronze', 'Silver'],
      });
      const visits = await call(ownerToken, 'POST', '/fields', {
        contentType: 'customer',
        label: 'Visits',
        type: 'number',
      });
      const created = await call(memberToken, 'POST', '/customers', {
        firstName: 'Custom',
        customFields: { [tier.body.id]: 'Silver', [visits.body.id]: 3 },
      });
      const wrong = await call(memberToken, 'PATCH', `/customers/${created.body.id}`, {
        customFields: { [tier.body.id]: 'Platinum' },
      });
      const cleared = await call(memberToken, 'PATCH', `/customers/${created.body.id}`, {
        customFields: { [visits.body.id]: null },
      });

      expect(created.body.customFields).toEqual({ [tier.body.id]: 'Silver', [visits.body.id]: 3 });
      expect(wrong.status).toBe(400);
      expect(wrong.body).toMatchObject({ code: 'INVALID_FIELD_VALUE', data: { fieldId: tier.body.id } });
      expect(cleared.body.customFields).toEqual({ [tier.body.id]: 'Silver' });

      const fields = await call(memberToken, 'GET', '/fields?contentType=customer');
      expect(fields.body.data.map((field) => field.id)).toEqual([tier.body.id, visits.body.id]);

      await call(ownerToken, 'DELETE', `/fields/${tier.body.id}`, {});
      expect((await call(ownerToken, 'GET', `/customers/${created.body.id}`)).body.customFields).toEqual({});
    });

    it('rejects fields of another record type', async () => {
      const companyField = await call(ownerToken, 'POST', '/fields', {
        contentType: 'company',
        label: 'Region',
        type: 'text',
      });
      const result = await call(ownerToken, 'POST', '/customers', {
        firstName: 'X',
        customFields: { [companyField.body.id]: 'North' },
      });

      expect(result.body.code).toBe('INVALID_FIELD');
    });
  });

  describe('companies', () => {
    it('creates companies with unique names and searches them', async () => {
      const created = await call(memberToken, 'POST', '/companies', {
        primaryName: 'Nomad Tech',
        names: ['Nomad LLC'],
        website: 'nomad.mn',
        size: 40,
      });
      const duplicate = await call(memberToken, 'POST', '/companies', { primaryName: 'nomad tech' });
      const search = await call(memberToken, 'GET', '/companies?search=llc');

      expect(created.body).toMatchObject({ primaryName: 'Nomad Tech', names: ['Nomad Tech', 'Nomad LLC'] });
      expect(duplicate.status).toBe(409);
      expect(duplicate.body).toMatchObject({ code: 'COMPANY_EXISTS', data: { id: created.body.id } });
      expect(search.body.data.map((item) => item.id)).toEqual([created.body.id]);
      expect((await call(otherOrgToken, 'GET', `/companies/${created.body.id}`)).status).toBe(404);
    });

    it('links customers and companies both ways', async () => {
      const company = await call(ownerToken, 'POST', '/companies', { primaryName: 'Steppe Foods' });
      const customer = await call(ownerToken, 'POST', '/customers', { firstName: 'Linked' });
      const link = `/customers/${customer.body.id}/companies/${company.body.id}`;

      expect((await call(ownerToken, 'PUT', link, {})).status).toBe(200);
      expect((await call(ownerToken, 'PUT', link, {})).status).toBe(200);

      const ofCustomer = await call(ownerToken, 'GET', `/customers/${customer.body.id}/companies`);
      const ofCompany = await call(ownerToken, 'GET', `/customers?companyId=${company.body.id}`);
      const companiesOf = await call(ownerToken, 'GET', `/companies?customerId=${customer.body.id}`);

      expect(ofCustomer.body.data.map((item) => item.primaryName)).toEqual(['Steppe Foods']);
      expect(ofCompany.body.data.map((item) => item.id)).toEqual([customer.body.id]);
      expect(companiesOf.body.data.map((item) => item.id)).toEqual([company.body.id]);

      await call(ownerToken, 'DELETE', link, {});
      expect((await call(ownerToken, 'GET', `/customers/${customer.body.id}/companies`)).body.data).toEqual([]);
      expect((await call(otherOrgToken, 'PUT', link, {})).status).toBe(404);
    });
  });

  describe('merge', () => {
    it('merges customers: fills empty fields, combines contacts, tags and companies', async () => {
      const t1 = await tag('customer', 'M1');
      const t2 = await tag('customer', 'M2');
      const company = await call(ownerToken, 'POST', '/companies', { primaryName: 'Merge Co' });
      const keep = await call(ownerToken, 'POST', '/customers', {
        state: 'lead',
        firstName: 'Bat',
        primaryEmail: 'bat@a.mn',
        tagIds: [t1],
      });
      const other = await call(ownerToken, 'POST', '/customers', {
        firstName: 'Batbold',
        lastName: 'Dorj',
        position: 'CEO',
        primaryEmail: 'bat@b.mn',
        phones: ['99112233'],
        tagIds: [t2],
      });

      await call(ownerToken, 'PUT', `/customers/${other.body.id}/companies/${company.body.id}`, {});

      expect(
        (await call(memberToken, 'POST', '/customers/merge', { ids: [keep.body.id, other.body.id], keepId: keep.body.id }))
          .status,
      ).toBe(403);

      const merged = await call(ownerToken, 'POST', '/customers/merge', {
        ids: [keep.body.id, other.body.id],
        keepId: keep.body.id,
      });

      expect(merged.status).toBe(200);
      expect(merged.body).toMatchObject({
        id: keep.body.id,
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
      expect((await call(ownerToken, 'GET', `/customers/${other.body.id}`)).body.id).toBe(keep.body.id);
      const ofKept = await call(ownerToken, 'GET', `/customers/${keep.body.id}/companies`);
      expect(ofKept.body.data.map((item) => item.id)).toEqual([company.body.id]);
      // The other's primary email is free again for the kept customer only.
      const reuse = await call(ownerToken, 'POST', '/customers', { primaryEmail: 'bat@a.mn' });
      expect(errorData(reuse.body)?.id).toBe(keep.body.id);
    });

    it('merges companies and keeps the other names', async () => {
      const keep = await call(ownerToken, 'POST', '/companies', { primaryName: 'Gobi', website: null });
      const other = await call(ownerToken, 'POST', '/companies', { primaryName: 'Gobi Cashmere', website: 'gobi.mn' });
      const merged = await call(ownerToken, 'POST', '/companies/merge', {
        ids: [keep.body.id, other.body.id],
        keepId: keep.body.id,
      });

      expect(merged.body).toMatchObject({ primaryName: 'Gobi', names: ['Gobi', 'Gobi Cashmere'] });
      expect((await call(ownerToken, 'GET', `/companies/${other.body.id}`)).body.id).toBe(keep.body.id);
    });

    it('refuses to merge records of another organisation', async () => {
      const mine = await call(ownerToken, 'POST', '/customers', { firstName: 'Mine' });
      const theirs = await call(otherOrgToken, 'POST', '/customers', { firstName: 'Theirs' });
      const result = await call(ownerToken, 'POST', '/customers/merge', {
        ids: [mine.body.id, theirs.body.id],
        keepId: mine.body.id,
      });

      expect(result.status).toBe(404);
    });
  });
});

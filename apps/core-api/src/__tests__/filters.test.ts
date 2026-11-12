import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('list filters (search, tags, owner)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let token = '';
  let ownerId = '';
  let vip = '';

  interface Page {
    data: { id: string; firstName: string | null; primaryName?: string; email?: string }[];
    totalCount: number;
  }

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return (await response.json()) as Page & { id: string };
  };

  const names = (page: Page) =>
    page.data.map((row) => row.firstName ?? row.primaryName ?? row.email).sort();
  const search = (path: string, query: Record<string, string>) =>
    call('GET', `${path}?${new URLSearchParams(query).toString()}`);

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', fullName: 'Bat Dorj' },
    });

    ownerId = acme.owner.id;
    token = signAccessToken(acme.owner.id, acme.organization.id);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    vip = (await call('POST', '/tags', { type: 'customer', name: 'VIP' })).id;
    await call('POST', '/customers', {
      firstName: 'Saraa',
      lastName: 'Bold',
      emails: ['saraa@nomad.mn', 'saraa.b@gmail.com'],
      phones: ['+976 9911-2233'],
      tagIds: [vip],
      ownerId,
    });
    await call('POST', '/customers', {
      firstName: 'Bold',
      lastName: 'Dorj',
      primaryEmail: 'bold@steppe.mn',
    });
    await call('POST', '/customers', { firstName: '50% off', code: 'A_1' });
    await call('POST', '/companies', {
      primaryName: 'Nomad Tech',
      names: ['Nomad LLC'],
      industry: 'Software',
    });
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('matches every word in any order, across name and email', async () => {
    expect(names(await search('/customers', { search: 'bold saraa' }))).toEqual(['Saraa']);
    expect(names(await search('/customers', { search: 'saraa nomad' }))).toEqual(['Saraa']);
    expect(names(await search('/customers', { search: 'bold' }))).toEqual(['Bold', 'Saraa']);
    expect(names(await search('/customers', { search: 'bold steppe' }))).toEqual(['Bold']);
  });

  it('finds other emails and formatted phones, not only the primary ones', async () => {
    expect(names(await search('/customers', { search: 'gmail' }))).toEqual(['Saraa']);
    expect(names(await search('/customers', { search: '9911 2233' }))).toEqual(['Saraa']);
    expect(names(await search('/customers', { search: '99112233' }))).toEqual(['Saraa']);
  });

  it('takes %, _ and \\ literally', async () => {
    expect(names(await search('/customers', { search: '50%' }))).toEqual(['50% off']);
    expect(names(await search('/customers', { search: 'A_1' }))).toEqual(['50% off']);
    expect((await search('/customers', { search: '%' })).totalCount).toBe(1);
  });

  it('combines search with tag and owner filters', async () => {
    expect(names(await search('/customers', { search: 'bold', tagIds: vip }))).toEqual(['Saraa']);
    expect(names(await search('/customers', { search: 'bold', ownerId }))).toEqual(['Saraa']);
    expect((await search('/customers', { search: 'dorj', tagIds: vip })).totalCount).toBe(0);
  });

  it('searches companies by any name, industry and team members by name or email', async () => {
    expect(names(await search('/companies', { search: 'llc nomad' }))).toEqual(['Nomad Tech']);
    expect(names(await search('/companies', { search: 'software' }))).toEqual(['Nomad Tech']);
    expect((await search('/users', { search: 'dorj bat' })).totalCount).toBe(1);
    expect((await search('/users', { search: 'acme.mn' })).totalCount).toBe(1);
  });
});

import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase } from './db';
import { type CoreClient, type CoreInputs, useTestServer } from './support';

const sorted = (values: (string | null)[]) =>
  values.map((value) => value ?? '').toSorted((a, b) => a.localeCompare(b));

describe('list filters (search, tags, owner)', () => {
  useTestDatabase();

  const server = useTestServer();
  let api: CoreClient;
  let ownerId = '';
  let vip = '';

  const customers = async (query: CoreInputs['customers']['list']) =>
    sorted((await api.customers.list(query)).data.map((row) => row.firstName));

  const companies = async (search: string) =>
    sorted((await api.companies.list({ search })).data.map((row) => row.primaryName));

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', fullName: 'Bat Dorj' },
    });

    ownerId = acme.owner.id;
    api = server.client({ user: ownerId, org: acme.organization.id });
    vip = (await api.tags.create({ type: 'customer', name: 'VIP' })).id;
    await api.customers.create({
      firstName: 'Saraa',
      lastName: 'Bold',
      emails: ['saraa@nomad.mn', 'saraa.b@gmail.com'],
      phones: ['+976 9911-2233'],
      tagIds: [vip],
      ownerId,
    });
    await api.customers.create({
      firstName: 'Bold',
      lastName: 'Dorj',
      primaryEmail: 'bold@steppe.mn',
    });
    await api.customers.create({ firstName: '50% off', code: 'A_1' });
    await api.companies.create({
      primaryName: 'Nomad Tech',
      names: ['Nomad LLC'],
      industry: 'Software',
    });
  });

  it('matches every word in any order, across name and email', async () => {
    expect(await customers({ search: 'bold saraa' })).toEqual(['Saraa']);
    expect(await customers({ search: 'saraa nomad' })).toEqual(['Saraa']);
    expect(await customers({ search: 'bold' })).toEqual(['Bold', 'Saraa']);
    expect(await customers({ search: 'bold steppe' })).toEqual(['Bold']);
  });

  it('finds other emails and formatted phones, not only the primary ones', async () => {
    expect(await customers({ search: 'gmail' })).toEqual(['Saraa']);
    expect(await customers({ search: '9911 2233' })).toEqual(['Saraa']);
    expect(await customers({ search: '99112233' })).toEqual(['Saraa']);
  });

  it('takes %, _ and \\ literally', async () => {
    expect(await customers({ search: '50%' })).toEqual(['50% off']);
    expect(await customers({ search: 'A_1' })).toEqual(['50% off']);
    expect((await api.customers.list({ search: '%' })).totalCount).toBe(1);
  });

  it('combines search with tag and owner filters', async () => {
    expect(await customers({ search: 'bold', tagIds: vip })).toEqual(['Saraa']);
    expect(await customers({ search: 'bold', ownerId })).toEqual(['Saraa']);
    expect(await customers({ search: 'dorj', tagIds: vip })).toEqual([]);
  });

  it('searches companies by any name, industry and team members by name or email', async () => {
    expect(await companies('llc nomad')).toEqual(['Nomad Tech']);
    expect(await companies('software')).toEqual(['Nomad Tech']);
    expect((await api.users.list({ search: 'dorj bat' })).totalCount).toBe(1);
    expect((await api.users.list({ search: 'acme.mn' })).totalCount).toBe(1);
  });
});

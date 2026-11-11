import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase, useTestServer } from './support';

const names = (page: {
  data: { firstName?: string | null; primaryName?: string | null; email?: string }[];
}) => page.data.map((row) => row.firstName ?? row.primaryName ?? row.email ?? '').toSorted();

describe('list filters (search, tags, owner)', () => {
  useTestDatabase();

  const server = useTestServer();
  let api = server.client();
  let ownerId = '';
  let vip = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', fullName: 'Bat Dorj' },
    });

    ownerId = acme.owner.id;
    api = server.client(signAccessToken(acme.owner.id, acme.organization.id));

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
    expect(names(await api.customers.list({ search: 'bold saraa' }))).toEqual(['Saraa']);
    expect(names(await api.customers.list({ search: 'saraa nomad' }))).toEqual(['Saraa']);
    expect(names(await api.customers.list({ search: 'bold' }))).toEqual(['Bold', 'Saraa']);
    expect(names(await api.customers.list({ search: 'bold steppe' }))).toEqual(['Bold']);
  });

  it('finds other emails and formatted phones, not only the primary ones', async () => {
    expect(names(await api.customers.list({ search: 'gmail' }))).toEqual(['Saraa']);
    expect(names(await api.customers.list({ search: '9911 2233' }))).toEqual(['Saraa']);
    expect(names(await api.customers.list({ search: '99112233' }))).toEqual(['Saraa']);
  });

  it('takes %, _ and \\ literally', async () => {
    expect(names(await api.customers.list({ search: '50%' }))).toEqual(['50% off']);
    expect(names(await api.customers.list({ search: 'A_1' }))).toEqual(['50% off']);
    expect((await api.customers.list({ search: '%' })).totalCount).toBe(1);
  });

  it('combines search with tag and owner filters', async () => {
    expect(names(await api.customers.list({ search: 'bold', tagIds: vip }))).toEqual(['Saraa']);
    expect(names(await api.customers.list({ search: 'bold', ownerId }))).toEqual(['Saraa']);
    expect((await api.customers.list({ search: 'dorj', tagIds: vip })).totalCount).toBe(0);
  });

  it('searches companies by any name, industry and team members by name or email', async () => {
    expect(names(await api.companies.list({ search: 'llc nomad' }))).toEqual(['Nomad Tech']);
    expect(names(await api.companies.list({ search: 'software' }))).toEqual(['Nomad Tech']);
    expect((await api.users.list({ search: 'dorj bat' })).totalCount).toBe(1);
    expect((await api.users.list({ search: 'acme.mn' })).totalCount).toBe(1);
  });
});

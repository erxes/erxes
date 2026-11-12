import { expect, it } from 'vite-plus/test';
import { describeWithDb, useTestDatabase } from './db';
import { type CoreInputs, useTwoOrgs } from './support';

describeWithDb('customers (/core/v1/customers)', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const firstNames = async (query: CoreInputs['customers']['list']) =>
    (await t.owner().customers.list(query)).data.map((customer) => customer.firstName);

  it('creates a customer with normalised contacts, primary first', async () => {
    const created = await t.member().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'Saraa@Mail.MN',
      emails: ['saraa@work.mn', 'saraa@mail.mn'],
      phones: ['+976 (9911) 22-33'],
    });

    expect(created).toMatchObject({
      state: 'customer',
      firstName: 'Saraa',
      primaryEmail: 'saraa@mail.mn',
      emails: ['saraa@mail.mn', 'saraa@work.mn'],
      primaryPhone: '+97699112233',
      phones: ['+97699112233'],
    });
  });

  it('needs a name, an email or a phone', async () => {
    await expect(t.owner().customers.create({ description: 'nobody' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });
  });

  it('refuses a taken primary email or phone and names the existing customer', async () => {
    const existing = await t
      .owner()
      .customers.create({ firstName: 'Bold', primaryPhone: '99001122' });

    await expect(
      t.owner().customers.create({ primaryEmail: 'SARAA@mail.mn' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'CUSTOMER_EXISTS',
      data: { field: 'primaryEmail' },
    });
    await expect(t.owner().customers.create({ phones: ['9900 1122'] })).rejects.toMatchObject({
      status: 409,
      data: { field: 'primaryPhone', id: existing.id },
    });
  });

  it('keeps customers of other organisations apart', async () => {
    const theirs = await t.other().customers.create({ primaryEmail: 'saraa@mail.mn' });
    const listed = await t.other().customers.list({});

    expect(listed.data.map((customer) => customer.id)).toEqual([theirs.id]);
    await expect(t.owner().customers.get({ id: theirs.id })).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      t.owner().customers.update({ id: theirs.id, firstName: 'x' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('updates contacts: a removed primary is replaced by the next one', async () => {
    const { id } = await t.owner().customers.create({
      firstName: 'Tuul',
      emails: ['tuul@a.mn', 'tuul@b.mn'],
    });

    const update = (changes: Omit<CoreInputs['customers']['update'], 'id'>) =>
      t.owner().customers.update({ id, ...changes });

    expect(await update({ primaryEmail: null })).toMatchObject({
      primaryEmail: 'tuul@b.mn',
      emails: ['tuul@b.mn'],
    });
    expect(await update({ emails: ['tuul@c.mn', 'tuul@b.mn'] })).toMatchObject({
      primaryEmail: 'tuul@b.mn',
      emails: ['tuul@b.mn', 'tuul@c.mn'],
    });
    expect(await update({ state: 'lead' })).toMatchObject({
      state: 'lead',
      firstName: 'Tuul',
      primaryEmail: 'tuul@b.mn',
    });
  });

  it('accepts only team members of the organisation as owner', async () => {
    const owned = await t.owner().customers.create({ firstName: 'Owned', ownerId: t.ids.owner });

    expect(owned.ownerId).toBe(t.ids.owner);
    await expect(
      t.owner().customers.create({ firstName: 'Foreign', ownerId: t.ids.otherOwner }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_OWNER' });
  });

  it('searches by name, email and phone, filters by state and pages by cursor', async () => {
    expect(await firstNames({ search: 'saraa' })).toEqual(['Saraa']);
    expect(await firstNames({ search: '9900-11' })).toEqual(['Bold']);
    expect(await firstNames({ state: 'lead' })).toEqual(['Tuul']);

    const first = await t.owner().customers.list({ limit: 2 });
    const cursor = first.pageInfo.endCursor ?? '';
    const rest = await t.owner().customers.list({ limit: 10, cursor });
    const reopen = await t.owner().customers.list({ limit: 10, cursorMode: 'inclusive', cursor });

    expect(first.totalCount).toBe(4);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect(rest.data).toHaveLength(2);
    expect(rest.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(reopen.data[0]?.id).toBe(cursor);
    expect(reopen.data).toHaveLength(3);
  });

  it('starts from the top when a remembered cursor is gone, and rejects it for paging', async () => {
    const reopen = await t.owner().customers.list({ cursorMode: 'inclusive', cursor: 'gone' });

    expect(reopen.data).toHaveLength(4);
    await expect(t.owner().customers.list({ cursor: 'gone' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_CURSOR',
    });
  });

  it('lets only owners and admins delete customers', async () => {
    const { id } = await t.owner().customers.create({ firstName: 'Temp' });

    await expect(t.member().customers.remove({ ids: [id] })).rejects.toMatchObject({
      status: 403,
    });
    expect((await t.owner().customers.remove({ ids: [id, 'missing'] })).removed).toBe(1);
    await expect(t.owner().customers.get({ id })).rejects.toMatchObject({ status: 404 });
  });
});

import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase, useTestServer } from './support';

const ids = (page: { data: { id: string }[] }) => page.data.map((item) => item.id);

describe('field groups, archiving and field settings', () => {
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

  it('creates groups with a code from the name, in order; only owners and admins manage them', async () => {
    await expect(
      member.fieldGroups.create({ contentType: 'customer', name: 'Loyalty' }),
    ).rejects.toMatchObject({ status: 403 });

    const loyalty = await owner.fieldGroups.create({
      contentType: 'customer',
      name: 'Loyalty Club',
    });

    expect(server.status()).toBe(201);

    const billing = await owner.fieldGroups.create({
      contentType: 'customer',
      name: 'Billing',
      code: 'billing',
    });

    expect(loyalty).toMatchObject({ code: 'loyalty_club', order: 0, archivedAt: null });
    expect(billing.order).toBe(1);
    await expect(
      owner.fieldGroups.create({ contentType: 'customer', name: 'Other', code: 'BILLING' }),
    ).rejects.toMatchObject({ code: 'FIELD_GROUP_EXISTS' });
    await expect(
      owner.fieldGroups.create({ contentType: 'customer', name: 'Хэрэглэгч' }),
    ).rejects.toMatchObject({ status: 400 });

    // Another organisation sees none of them.
    expect((await otherOrg.fieldGroups.list({ contentType: 'customer' })).data).toEqual([]);

    await owner.fieldGroups.reorder({
      orders: [
        { id: loyalty.id, order: 1 },
        { id: billing.id, order: 0 },
      ],
    });
    expect(ids(await member.fieldGroups.list({ contentType: 'customer' }))).toEqual([
      billing.id,
      loyalty.id,
    ]);
  });

  it('puts fields in a group of their record type, with code, visibility and validation', async () => {
    const group = await owner.fieldGroups.create({ contentType: 'customer', name: 'Contact' });

    const companyGroup = await owner.fieldGroups.create({
      contentType: 'company',
      name: 'Contact',
    });

    await expect(
      owner.fields.create({
        contentType: 'customer',
        label: 'Wrong group',
        type: 'text',
        groupId: companyGroup.id,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    const email = await owner.fields.create({
      contentType: 'customer',
      label: 'Work email',
      type: 'text',
      groupId: group.id,
      code: 'work_email',
      validation: 'email',
      icon: 'IconMail',
      isVisible: false,
    });

    expect(email).toMatchObject({
      groupId: group.id,
      code: 'work_email',
      validation: 'email',
      isVisible: false,
      archivedAt: null,
    });
    await expect(
      owner.fields.create({
        contentType: 'customer',
        label: 'Another',
        type: 'text',
        code: 'WORK_EMAIL',
      }),
    ).rejects.toMatchObject({
      code: 'FIELD_EXISTS',
      message: 'A field with this code already exists',
    });

    const phone = await owner.fields.create({
      contentType: 'customer',
      label: 'Desk',
      type: 'phone',
    });

    const sizes = await owner.fields.create({
      contentType: 'customer',
      label: 'Sizes',
      type: 'check',
      options: ['S', 'M', 'L'],
    });

    const notes = await owner.fields.create({
      contentType: 'customer',
      label: 'Notes',
      type: 'list',
    });

    await expect(
      owner.customers.create({
        firstName: 'Bat',
        customFields: { [email.id]: 'not-an-email' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    const customer = await owner.customers.create({
      firstName: 'Bat',
      customFields: {
        [email.id]: 'bat@acme.mn',
        [phone.id]: '+976 9911 2233',
        [sizes.id]: ['S', 'L', 'S'],
        [notes.id]: [' first ', '', 'second'],
      },
    });

    expect(customer.customFields).toEqual({
      [email.id]: 'bat@acme.mn',
      [phone.id]: '+976 9911 2233',
      [sizes.id]: ['S', 'L'],
      [notes.id]: ['first', 'second'],
    });
    await expect(
      owner.customers.update({ id: customer.id, customFields: { [phone.id]: 'abc' } }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    // Usage counts records and, for option fields, each option.
    const usage = await member.fields.usage({ ids: `${sizes.id},${email.id}` });

    expect(usage).toMatchObject({
      records: 1,
      removable: false,
      options: { [sizes.id]: { S: 1, L: 1 } },
    });
    expect(await member.fields.usage({ groupId: group.id })).toMatchObject({ records: 1 });

    // In use: the type changes only within types sharing a stored value.
    expect((await owner.fields.update({ id: sizes.id, type: 'multiselect' })).type).toBe(
      'multiselect',
    );
    await expect(owner.fields.update({ id: sizes.id, type: 'number' })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    // Unused: anything goes; options are needed for option types and dropped otherwise.
    const free = await owner.fields.create({
      contentType: 'customer',
      label: 'Free',
      type: 'text',
    });

    await expect(owner.fields.update({ id: free.id, type: 'radio' })).rejects.toMatchObject({
      status: 400,
    });
    expect(
      await owner.fields.update({ id: free.id, type: 'radio', options: ['A', 'B'] }),
    ).toMatchObject({ type: 'radio', options: ['A', 'B'], validation: null });

    // Moved into a group, hidden, with a validation dropped for non-text types.
    const moved = await owner.fields.update({
      id: phone.id,
      groupId: group.id,
      isVisible: false,
      validation: 'number',
    });

    expect(moved).toMatchObject({ groupId: group.id, isVisible: false, validation: null });
    await expect(
      owner.fields.update({ id: phone.id, groupId: companyGroup.id }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    const inGroup = await member.fields.list({ contentType: 'customer', groupId: group.id });

    expect(ids(inGroup)).toEqual([email.id, phone.id]);

    await owner.fields.reorder({
      orders: [
        { id: email.id, order: phone.order },
        { id: phone.id, order: email.order },
      ],
    });
    expect(ids(await member.fields.list({ contentType: 'customer', groupId: group.id }))).toEqual([
      phone.id,
      email.id,
    ]);
  });

  it('archives and restores fields; archived ones keep values and can only be cleared', async () => {
    const field = await owner.fields.create({
      contentType: 'company',
      label: 'Region',
      type: 'text',
    });

    const company = await owner.companies.create({
      primaryName: 'Archive LLC',
      customFields: { [field.id]: 'North' },
    });

    await expect(member.fields.archive({ ids: [field.id] })).rejects.toMatchObject({
      status: 403,
    });
    expect(await owner.fields.archive({ ids: [field.id] })).toEqual({ ok: true });

    expect(ids(await owner.fields.list({ contentType: 'company' }))).not.toContain(field.id);

    const archived = await owner.fields.list({ contentType: 'company', archived: true });

    expect(archived.data.find((item) => item.id === field.id)?.archivedAt).toBeTruthy();

    expect((await owner.companies.get({ id: company.id })).customFields).toEqual({
      [field.id]: 'North',
    });
    await expect(
      owner.companies.update({ id: company.id, customFields: { [field.id]: 'South' } }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD' });

    // Records hold values: it cannot be deleted through the "unused" path.
    await expect(owner.fields.removeUnused({ ids: [field.id] })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    const restored = await owner.fields.restore({ id: field.id });
    expect(restored.archivedAt).toBeNull();
    expect(
      (await owner.companies.update({ id: company.id, customFields: { [field.id]: 'South' } }))
        .customFields,
    ).toEqual({ [field.id]: 'South' });

    await owner.companies.update({ id: company.id, customFields: { [field.id]: null } });
    expect(await owner.fields.removeUnused({ ids: [field.id] })).toEqual({ ok: true });
    expect(await owner.fields.usage({ ids: field.id })).toMatchObject({ records: 0 });
  });

  it('archives a group with its fields, and deletes it only while no record holds their values', async () => {
    const group = await owner.fieldGroups.create({ contentType: 'company', name: 'Finance' });

    const field = await owner.fields.create({
      contentType: 'company',
      label: 'Budget',
      type: 'number',
      groupId: group.id,
    });

    const company = await owner.companies.create({
      primaryName: 'Group LLC',
      customFields: { [field.id]: 10 },
    });

    const archived = await owner.fieldGroups.archive({ id: group.id });
    expect(archived.archivedAt).toBeTruthy();
    expect(ids(await owner.fieldGroups.list({ contentType: 'company' }))).not.toContain(group.id);
    expect(ids(await owner.fieldGroups.list({ contentType: 'company', archived: true }))).toEqual([
      group.id,
    ]);
    // Its fields count as archived while it is.
    expect(ids(await owner.fields.list({ contentType: 'company' }))).not.toContain(field.id);
    expect(ids(await owner.fields.list({ contentType: 'company', archived: true }))).toContain(
      field.id,
    );
    await expect(
      owner.companies.update({ id: company.id, customFields: { [field.id]: 20 } }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    await expect(
      owner.fields.create({
        contentType: 'company',
        label: 'Late',
        type: 'text',
        groupId: group.id,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    await expect(owner.fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    await owner.fieldGroups.restore({ id: group.id });
    expect(ids(await owner.fields.list({ contentType: 'company' }))).toContain(field.id);

    await owner.companies.update({ id: company.id, customFields: { [field.id]: null } });
    await expect(member.fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      status: 403,
    });
    expect(await owner.fieldGroups.remove({ id: group.id })).toEqual({ ok: true });
    expect(server.status()).toBe(200);
    expect(ids(await owner.fields.list({ contentType: 'company' }))).not.toContain(field.id);
    await expect(otherOrg.fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('keeps the old field API working: no group, DELETE removes values', async () => {
    const field = await owner.fields.create({
      contentType: 'customer',
      label: 'Legacy',
      type: 'text',
    });

    const customer = await owner.customers.create({
      firstName: 'Old',
      customFields: { [field.id]: 'kept' },
    });

    expect(field).toMatchObject({ groupId: null, code: null, isVisible: true, archivedAt: null });
    expect(await owner.fields.remove({ id: field.id })).toEqual({ ok: true });
    expect(server.status()).toBe(200);
    expect((await owner.customers.get({ id: customer.id })).customFields).toEqual({});
  });
});

import { expect, it } from 'vite-plus/test';
import { describeWithDb, useTestDatabase } from './db';
import { type CoreInputs, useTwoOrgs } from './support';

const idsOf = (page: { data: { id: string }[] }) => page.data.map((item) => item.id);

/** Field groups and the fields in them: codes, types, values and usage. Archiving: `fieldArchive.test.ts`. */
describeWithDb('field groups and field settings', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const group = (input: CoreInputs['fieldGroups']['create']) => t.owner().fieldGroups.create(input);
  const field = (input: CoreInputs['fields']['create']) => t.owner().fields.create(input);

  const customerField = (label: string, type: CoreInputs['fields']['create']['type']) =>
    field({ contentType: 'customer', label, type });

  it('creates groups with a code from the name, in order; only owners and admins manage them', async () => {
    await expect(
      t.member().fieldGroups.create({ contentType: 'customer', name: 'Loyalty' }),
    ).rejects.toMatchObject({ status: 403 });

    const loyalty = await group({ contentType: 'customer', name: 'Loyalty Club' });
    const billing = await group({ contentType: 'customer', name: 'Billing', code: 'billing' });

    expect(loyalty).toMatchObject({ code: 'loyalty_club', order: 0, archivedAt: null });
    expect(billing.order).toBe(1);
    await expect(
      group({ contentType: 'customer', name: 'Other', code: 'BILLING' }),
    ).rejects.toMatchObject({ code: 'FIELD_GROUP_EXISTS' });
    // No code can be made from this name.
    await expect(group({ contentType: 'customer', name: 'Хэрэглэгч' })).rejects.toMatchObject({
      status: 400,
    });
    // Another organisation sees none of them.
    expect((await t.other().fieldGroups.list({ contentType: 'customer' })).data).toEqual([]);

    await t.owner().fieldGroups.reorder({
      orders: [
        { id: loyalty.id, order: 1 },
        { id: billing.id, order: 0 },
      ],
    });
    expect(idsOf(await t.member().fieldGroups.list({ contentType: 'customer' }))).toEqual([
      billing.id,
      loyalty.id,
    ]);
  });

  it('puts fields in a group of their record type, with code, visibility and validation, and checks values', async () => {
    const contact = await group({ contentType: 'customer', name: 'Contact' });
    const companyContact = await group({ contentType: 'company', name: 'Contact' });

    await expect(
      field({
        contentType: 'customer',
        label: 'Wrong group',
        type: 'text',
        groupId: companyContact.id,
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_FIELD_GROUP',
    });

    const email = await field({
      contentType: 'customer',
      label: 'Work email',
      type: 'text',
      groupId: contact.id,
      code: 'work_email',
      validation: 'email',
      icon: 'IconMail',
      isVisible: false,
    });

    expect(email).toMatchObject({
      groupId: contact.id,
      code: 'work_email',
      validation: 'email',
      isVisible: false,
      archivedAt: null,
    });
    await expect(
      field({ contentType: 'customer', label: 'Another', type: 'text', code: 'WORK_EMAIL' }),
    ).rejects.toMatchObject({
      code: 'FIELD_EXISTS',
      message: 'A field with this code already exists',
    });

    const phone = await customerField('Desk', 'phone');

    const sizes = await field({
      contentType: 'customer',
      label: 'Sizes',
      type: 'check',
      options: ['S', 'M', 'L'],
    });

    const notes = await customerField('Notes', 'list');

    await expect(
      t
        .owner()
        .customers.create({ firstName: 'Bat', customFields: { [email.id]: 'not-an-email' } }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    const customer = await t.owner().customers.create({
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
      t.owner().customers.update({ id: customer.id, customFields: { [phone.id]: 'abc' } }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    // Usage counts records and, for option fields, each option.
    expect(await t.member().fields.usage({ ids: `${sizes.id},${email.id}` })).toMatchObject({
      records: 1,
      removable: false,
      options: { [sizes.id]: { S: 1, L: 1 } },
    });
    expect(await t.member().fields.usage({ groupId: contact.id })).toMatchObject({ records: 1 });
  });

  it('changes types within what stored values allow, moves fields between groups and orders them', async () => {
    const contact = await group({ contentType: 'customer', name: 'Moves' });
    const elsewhere = await group({ contentType: 'company', name: 'Moves' });

    const sizes = await field({
      contentType: 'customer',
      label: 'Fits',
      type: 'check',
      options: ['S', 'M'],
    });

    const email = await field({
      contentType: 'customer',
      label: 'Mail',
      type: 'text',
      groupId: contact.id,
    });

    const phone = await customerField('Mobile', 'phone');

    const update = (id: string, changes: Omit<CoreInputs['fields']['update'], 'id'>) =>
      t.owner().fields.update({ id, ...changes });

    await t.owner().customers.create({ firstName: 'Fit', customFields: { [sizes.id]: ['S'] } });

    // In use: the type changes only within types sharing a stored value.
    expect((await update(sizes.id, { type: 'multiselect' })).type).toBe('multiselect');
    await expect(update(sizes.id, { type: 'number' })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    // Unused: anything goes; options are needed for option types and dropped otherwise.
    const free = await customerField('Free', 'text');

    await expect(update(free.id, { type: 'radio' })).rejects.toMatchObject({ status: 400 });
    expect(await update(free.id, { type: 'radio', options: ['A', 'B'] })).toMatchObject({
      type: 'radio',
      options: ['A', 'B'],
      validation: null,
    });

    // Moved into a group, hidden, with a validation dropped for non-text types.
    expect(
      await update(phone.id, { groupId: contact.id, isVisible: false, validation: 'number' }),
    ).toMatchObject({ groupId: contact.id, isVisible: false, validation: null });
    await expect(update(phone.id, { groupId: elsewhere.id })).rejects.toMatchObject({
      code: 'INVALID_FIELD_GROUP',
    });

    const inGroup = async () =>
      idsOf(await t.member().fields.list({ contentType: 'customer', groupId: contact.id }));

    expect(await inGroup()).toEqual([email.id, phone.id]);
    await t.owner().fields.reorder({
      orders: [
        { id: email.id, order: phone.order },
        { id: phone.id, order: email.order },
      ],
    });
    expect(await inGroup()).toEqual([phone.id, email.id]);
  });
});

import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { type CoreInputs, useTwoOrgs } from './support';

const idsOf = (page: { data: { id: string }[] }) => page.data.map((item) => item.id);

/** Archiving and deleting fields and field groups, and what that does to stored values. */
describe('field archiving', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const companyFields = async (archived?: 'true') =>
    idsOf(await t.owner().fields.list({ contentType: 'company', archived }));

  const setValue = (
    company: string,
    field: string,
    value: CoreInputs['companies']['update']['customFields'],
  ) => t.owner().companies.update({ id: company, customFields: value ?? { [field]: null } });

  it('archives and restores fields; archived ones keep values and can only be cleared', async () => {
    const field = await t
      .owner()
      .fields.create({ contentType: 'company', label: 'Region', type: 'text' });

    const company = await t
      .owner()
      .companies.create({ primaryName: 'Archive LLC', customFields: { [field.id]: 'North' } });

    await expect(t.member().fields.archive({ ids: [field.id] })).rejects.toMatchObject({
      status: 403,
    });
    await t.owner().fields.archive({ ids: [field.id] });
    expect(await companyFields()).not.toContain(field.id);

    const archived = await t.owner().fields.list({ contentType: 'company', archived: 'true' });

    expect(archived.data.find((item) => item.id === field.id)?.archivedAt).toMatch(/^\d{4}-/);
    expect((await t.owner().companies.get({ id: company.id })).customFields).toEqual({
      [field.id]: 'North',
    });
    await expect(setValue(company.id, field.id, { [field.id]: 'South' })).rejects.toMatchObject({
      code: 'INVALID_FIELD',
    });
    // Records hold values: it cannot be deleted through the "unused" path.
    await expect(t.owner().fields.removeUnused({ ids: [field.id] })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    expect((await t.owner().fields.restore({ id: field.id })).archivedAt).toBeNull();
    expect((await setValue(company.id, field.id, { [field.id]: 'South' })).customFields).toEqual({
      [field.id]: 'South',
    });

    await setValue(company.id, field.id, { [field.id]: null });
    await t.owner().fields.removeUnused({ ids: [field.id] });
    expect(await t.owner().fields.usage({ ids: field.id })).toMatchObject({ records: 0 });
  });

  it('archives a group with its fields, and deletes it only while no record holds their values', async () => {
    const group = await t.owner().fieldGroups.create({ contentType: 'company', name: 'Finance' });

    const field = await t.owner().fields.create({
      contentType: 'company',
      label: 'Budget',
      type: 'number',
      groupId: group.id,
    });

    const company = await t
      .owner()
      .companies.create({ primaryName: 'Group LLC', customFields: { [field.id]: 10 } });

    const groups = async (archived?: 'true') =>
      idsOf(await t.owner().fieldGroups.list({ contentType: 'company', archived }));

    expect((await t.owner().fieldGroups.archive({ id: group.id })).archivedAt).toMatch(/^\d{4}-/);
    expect(await groups()).not.toContain(group.id);
    expect(await groups('true')).toEqual([group.id]);
    // Its fields count as archived while it is.
    expect(await companyFields()).not.toContain(field.id);
    expect(await companyFields('true')).toContain(field.id);
    await expect(setValue(company.id, field.id, { [field.id]: 20 })).rejects.toMatchObject({
      code: 'INVALID_FIELD',
    });
    await expect(
      t.owner().fields.create({
        contentType: 'company',
        label: 'Late',
        type: 'text',
        groupId: group.id,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_GROUP' });
    await expect(t.owner().fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });

    await t.owner().fieldGroups.restore({ id: group.id });
    expect(await companyFields()).toContain(field.id);

    await setValue(company.id, field.id, { [field.id]: null });
    await expect(t.member().fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      status: 403,
    });
    await t.owner().fieldGroups.remove({ id: group.id });
    expect(await companyFields()).not.toContain(field.id);
    await expect(t.other().fieldGroups.remove({ id: group.id })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('deletes a field outside any group with its values', async () => {
    const field = await t
      .owner()
      .fields.create({ contentType: 'customer', label: 'Legacy', type: 'text' });

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Old', customFields: { [field.id]: 'kept' } });

    expect(field).toMatchObject({ groupId: null, code: null, isVisible: true, archivedAt: null });
    await t.owner().fields.remove({ id: field.id });
    expect((await t.owner().customers.get({ id: customer.id })).customFields).toEqual({});
  });
});

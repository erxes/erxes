import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('Data Extensions: records and values', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const setUp = async () => {
    const owner = t.owner();

    await owner.dataObjects.create({
      key: 'project',
      singularLabel: 'Project',
      pluralLabel: 'Projects',
    });

    const field = (input: Parameters<typeof owner.dataFields.create>[0]) =>
      owner.dataFields.create(input);

    await field({
      recordType: 'custom.project',
      key: 'code',
      label: 'Code',
      type: 'text',
      settings: { unique: true },
    });
    await field({ recordType: 'custom.project', key: 'budget', label: 'Budget', type: 'currency' });
    await field({
      recordType: 'custom.project',
      key: 'score',
      label: 'Score',
      type: 'number',
      settings: { min: 0, max: 10 },
    });
    await field({ recordType: 'custom.project', key: 'due', label: 'Due', type: 'date' });
    await field({
      recordType: 'custom.project',
      key: 'tags',
      label: 'Tags',
      type: 'multiSelect',
      options: [
        { value: 'web', label: 'Web', color: 'blue' },
        { value: 'ops', label: 'Ops', color: 'red' },
      ],
    });
    await field({ recordType: 'custom.project', key: 'lead', label: 'Lead', type: 'member' });
    await field({
      recordType: 'custom.project',
      key: 'contact',
      label: 'Contact',
      type: 'fullName',
    });
  };

  it('keeps each type’s value as it was written', async () => {
    await setUp();

    const values = {
      name: 'Website',
      code: 'WEB-1',
      budget: { amount: 1250.5, currency: 'MNT' },
      score: 7,
      due: '2026-12-01',
      tags: ['web', 'ops'],
      lead: t.ids.member,
      contact: { firstName: 'Bat', lastName: 'Dorj' },
    };

    const record = await t.member().dataRecords.create({ objectKey: 'project', values });

    expect(record).toMatchObject({
      recordType: 'custom.project',
      label: 'Website',
      createdBy: t.ids.member,
      deletedAt: null,
      values,
    });
    await expect(
      t.member().dataRecords.get({ objectKey: 'project', id: record.id }),
    ).resolves.toEqual(record);
  });

  it('checks every value against its field', async () => {
    const member = t.member();

    const bad = (values: Parameters<typeof member.dataRecords.create>[0]['values']) =>
      member.dataRecords.create({ objectKey: 'project', values });

    await expect(bad({ score: 11 })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['values', 'score'] }] },
    });
    await expect(bad({ tags: ['other'] })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(bad({ nothing: 1 })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(bad({ lead: 'not-a-member-id1' })).rejects.toMatchObject({
      code: 'INVALID_REFERENCE',
      data: { field: 'values.lead' },
    });
    await expect(bad({ code: 'WEB-1' })).rejects.toMatchObject({
      status: 409,
      code: 'TAKEN',
      data: { field: 'values.code' },
    });
  });

  it('filters, sorts, searches and pages records', async () => {
    const member = t.member();

    const add = (name: string, score: number | null) =>
      member.dataRecords.create({ objectKey: 'project', values: { name, score } });

    await add('Mobile app', 3);
    await add('Data warehouse', 9);
    await add('Office move', null);

    const byScore = await member.dataRecords.list({
      objectKey: 'project',
      sortField: 'score',
      sortDirection: 'asc',
      limit: 2,
    });

    expect(byScore.data.map((row) => row.label)).toEqual(['Mobile app', 'Website']);
    expect(byScore).toMatchObject({ totalCount: 4, pageInfo: { hasNextPage: true } });

    const rest = await member.dataRecords.list({
      objectKey: 'project',
      sortField: 'score',
      sortDirection: 'asc',
      limit: 2,
      cursor: byScore.pageInfo.endCursor ?? undefined,
    });

    // Records without a score come last.
    expect(rest.data.map((row) => row.label)).toEqual(['Data warehouse', 'Office move']);
    expect(rest.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });

    const filter = JSON.stringify({
      match: 'all',
      rules: [{ path: 'subject.score', op: 'gte', value: 5 }],
    });

    const high = await member.dataRecords.list({ objectKey: 'project', filter });

    expect(high.data.map((row) => row.label ?? '').toSorted((a, b) => a.localeCompare(b))).toEqual([
      'Data warehouse',
      'Website',
    ]);

    const found = await member.dataRecords.list({ objectKey: 'project', search: 'ware' });

    expect(found.data.map((row) => row.label)).toEqual(['Data warehouse']);
    await expect(
      member.dataRecords.list({
        objectKey: 'project',
        filter: JSON.stringify({
          match: 'all',
          rules: [{ path: 'subject.nope', op: 'eq', value: 1 }],
        }),
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });
  });

  it('moves records to the recycle bin and back; a binned value is free', async () => {
    const member = t.member();
    const { data } = await member.dataRecords.list({ objectKey: 'project', search: 'website' });
    const [website] = data;

    if (!website) throw new Error('Expected the website project');

    await t.owner().dataRecords.remove({ objectKey: 'project', id: website.id });
    await expect(
      member.dataRecords.remove({ objectKey: 'project', id: website.id }),
    ).rejects.toMatchObject({ status: 403 });

    const binned = await member.dataRecords.list({ objectKey: 'project', deleted: true });

    expect(binned.data.map((row) => row.id)).toEqual([website.id]);

    const again = await member.dataRecords.create({
      objectKey: 'project',
      values: { name: 'Website 2', code: 'WEB-1' },
    });

    await member.dataRecords.update({
      objectKey: 'project',
      id: again.id,
      values: { code: 'WEB-2' },
    });
    await expect(
      t.owner().dataRecords.restore({ objectKey: 'project', id: website.id }),
    ).resolves.toMatchObject({ deletedAt: null, label: 'Website' });
  });

  it('keeps values on core’s records, behind the record’s own rights', async () => {
    const owner = t.owner();
    const customer = await owner.customers.create({ firstName: 'Nora', ownerId: t.ids.owner });

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'vip',
      label: 'VIP',
      type: 'boolean',
    });

    await expect(
      t.member().dataValues.update({
        recordType: 'core.customer',
        recordId: customer.id,
        values: { vip: true },
      }),
    ).resolves.toMatchObject({ values: { vip: true }, updatedBy: t.ids.member });

    const { data } = await owner.dataValues.lookup({
      recordType: 'core.customer',
      recordIds: [customer.id],
    });

    expect(data).toMatchObject([{ recordId: customer.id, values: { vip: true } }]);
    await expect(
      owner.dataValues.get({ recordType: 'core.customer', recordId: 'NoSuchCustomer1' }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    await expect(
      t.other().dataValues.get({ recordType: 'core.customer', recordId: customer.id }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
  });

  it('links records both ways', async () => {
    const owner = t.owner();
    const company = await owner.companies.create({ primaryName: 'Nomad LLC' });

    await owner.dataFields.relate({
      recordType: 'custom.project',
      key: 'client',
      label: 'Client',
      targetRecordType: 'core.company',
      kind: 'manyToOne',
      inverseKey: 'projects',
      inverseLabel: 'Projects',
    });

    const project = await owner.dataRecords.create({
      objectKey: 'project',
      values: { name: 'Rebrand', client: company.id },
    });

    expect(project.values.client).toBe(company.id);
    await expect(
      owner.dataValues.get({ recordType: 'core.company', recordId: company.id }),
    ).resolves.toMatchObject({ values: { projects: [project.id] } });

    await owner.dataRecords.remove({ objectKey: 'project', id: project.id });
    await expect(
      owner.dataValues.get({ recordType: 'core.company', recordId: company.id }),
    ).resolves.toMatchObject({ values: { projects: [] } });
  });
});

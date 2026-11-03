import {
  MergeCompany,
  buildCompanyMergeFields,
  buildMergeConflicts,
  buildMergeResults,
  buildMergeRows,
  getCompanyMergeName,
  orderMergeCompanies,
} from './companyMerge';

const company = (overrides: Partial<MergeCompany>): MergeCompany => ({
  _id: 'c1',
  primaryName: 'Acme',
  ...overrides,
});

describe('company merge', () => {
  it('only marks differing, filled-in fields as conflicts', () => {
    const rows = buildMergeRows([
      company({ _id: 'a', primaryName: 'Acme', code: 'A1', size: 10 }),
      company({ _id: 'b', primaryName: 'Acme LLC', code: 'A1' }),
    ]);

    const conflicts = rows
      .filter((row) => row.conflict)
      .map((r) => r.field.key);
    expect(conflicts).toEqual(['primaryName']);
  });

  it('keeps the first company by default and follows the selection', () => {
    const rows = buildMergeRows([
      company({ _id: 'a', primaryName: 'Acme' }),
      company({ _id: 'b', primaryName: 'Acme LLC', size: 25 }),
    ]);

    expect(buildCompanyMergeFields(rows, {})).toEqual({
      primaryName: 'Acme',
      size: 25,
    });
    expect(buildCompanyMergeFields(rows, { primaryName: '1' })).toEqual({
      primaryName: 'Acme LLC',
      size: 25,
    });
  });

  it('combines list fields instead of asking', () => {
    const rows = buildMergeRows([
      company({ _id: 'a', emails: ['a@x.mn'], industry: ['Retail'] }),
      company({ _id: 'b', emails: ['b@x.mn', 'a@x.mn'], industry: ['Tech'] }),
    ]);

    const fields = buildCompanyMergeFields(rows, {});
    expect(fields.emails).toEqual(['a@x.mn', 'b@x.mn']);
    expect(fields.industry).toEqual(['Retail', 'Tech']);
    expect(rows.some((row) => row.conflict && row.field.key === 'emails')).toBe(
      false,
    );
  });

  it('sends owner and parent company as ids', () => {
    const rows = buildMergeRows([
      company({
        _id: 'a',
        owner: { _id: 'u1', username: 'bat' },
        ownerId: 'u1',
      }),
      company({
        _id: 'b',
        owner: { _id: 'u2', username: 'dorj' },
        ownerId: 'u2',
        parentCompanyId: 'p1',
        parentCompany: { _id: 'p1', primaryName: 'Holding' },
      }),
    ]);

    expect(buildCompanyMergeFields(rows, { owner: '1' })).toMatchObject({
      ownerId: 'u2',
      parentCompanyId: 'p1',
    });
  });

  it('drops a parent company that is one of the merged companies', () => {
    const rows = buildMergeRows([
      company({ _id: 'a' }),
      company({ _id: 'b', parentCompanyId: 'a' }),
    ]);

    expect(buildCompanyMergeFields(rows, {})).not.toHaveProperty(
      'parentCompanyId',
    );
  });

  it('merges free-form links key by key', () => {
    const rows = buildMergeRows([
      company({ _id: 'a', links: { facebook: 'fb.com/acme' } }),
      company({
        _id: 'b',
        links: { facebook: 'fb.com/acme-llc', github: 'github.com/acme' },
      }),
    ]);

    expect(
      buildCompanyMergeFields(rows, { 'links.facebook': '1' }).links,
    ).toEqual({ facebook: 'fb.com/acme-llc', github: 'github.com/acme' });
  });

  it('builds render-ready conflicts and preview items', () => {
    const rows = buildMergeRows([
      company({ _id: 'a', primaryName: 'Acme', code: 'A1' }),
      company({ _id: 'b', primaryName: 'Acme LLC' }),
    ]);

    expect(buildMergeConflicts(rows, { primaryName: '1' })).toEqual([
      {
        key: 'primaryName',
        label: 'Name',
        type: 'string',
        selected: '1',
        options: [
          { choice: '0', fieldValue: 'Acme' },
          { choice: '1', fieldValue: 'Acme LLC' },
        ],
      },
    ]);
    expect(
      buildMergeResults(rows, { primaryName: '1' }).map(({ key, value }) => [
        key,
        value,
      ]),
    ).toEqual([
      ['primaryName', 'Acme LLC'],
      ['code', 'A1'],
    ]);
  });

  it('orders fetched companies by selection and names them', () => {
    const first = company({
      _id: 'a',
      primaryName: '',
      primaryEmail: 'a@x.mn',
    });
    const second = company({ _id: 'b', primaryName: 'Beta' });

    expect(orderMergeCompanies([second, first], ['a', 'b'])).toEqual([
      first,
      second,
    ]);
    expect(orderMergeCompanies([second], ['a', 'b'])).toBeNull();
    expect(getCompanyMergeName(first)).toBe('a@x.mn');
  });
});

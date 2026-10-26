import {
  findSegmentTreeIssues,
  TSegmentCatalogField,
  TSegmentCatalogRelation,
  TSegmentTreeCatalog,
} from '../segmentTreeValidation';

const spec = (value: string, input = 'field') => ({ value, input });
const presence = [spec('is', 'none'), spec('ins', 'none')];

const fields: Record<string, TSegmentCatalogField[]> = {
  'core:contacts.customers': [
    {
      key: 'primaryEmail',
      label: 'Primary email',
      input: 'text',
      operators: [spec('e'), spec('c'), ...presence],
    },
    {
      key: 'state',
      label: 'State',
      input: 'select',
      source: 'static',
      options: [{ value: 'lead' }, { value: 'customer' }],
      operators: [spec('e'), spec('in'), ...presence],
    },
    {
      key: 'createdAt',
      label: 'Created at',
      input: 'date',
      operators: [spec('dateigt'), spec('woad', 'number'), ...presence],
    },
  ],
  'sales:sales.deals': [
    {
      key: 'amount',
      label: 'Amount',
      input: 'number',
      operators: [spec('numberigt'), spec('e'), ...presence],
    },
  ],
};

const relations: Record<string, TSegmentCatalogRelation[]> = {
  'core:contacts.customers': [
    {
      key: 'deals',
      label: 'Deals',
      relatedType: 'sales:sales.deals',
      measureOperators: [spec('numberigt'), spec('e'), ...presence],
    },
  ],
};

const catalog: TSegmentTreeCatalog = {
  fieldsOf: async (contentType) => fields[contentType] || [],
  relationsOf: async (subjectType) => relations[subjectType] || [],
};

const CUSTOMERS = 'core:contacts.customers';

const field = (fieldKey: string, operator: string, value?: unknown) => ({
  kind: 'field',
  contentType: CUSTOMERS,
  fieldKey,
  operator,
  ...(value !== undefined && { value }),
});

const group = (...children: unknown[]) => ({
  kind: 'group',
  conjunction: 'and',
  children,
});

const issuesOf = (root: unknown, previous?: unknown) =>
  findSegmentTreeIssues({ contentType: CUSTOMERS, root, previous }, catalog);

describe('a new tree', () => {
  it('passes conditions the form could have written', async () => {
    expect(
      await issuesOf(
        group(
          field('primaryEmail', 'c', '@erxes.io'),
          field('state', 'in', ['lead', 'customer']),
          field('createdAt', 'woad', 7),
          field('primaryEmail', 'is'),
          field('primaryEmail', 'dateis'),
        ),
      ),
    ).toEqual([]);
  });

  it('needs at least one condition, since an empty one matches nothing', async () => {
    expect(await issuesOf(group())).toEqual([
      {
        path: 'root',
        message:
          'Add at least one condition; a segment without conditions matches nothing',
      },
    ]);
  });

  it('names fields, operators and values the catalogue does not allow', async () => {
    expect(
      await issuesOf(
        group(
          field('favouriteColor', 'e', 'blue'),
          field('primaryEmail', 'numberigt', 3),
          field('primaryEmail', 'e'),
          field('createdAt', 'woad', 'last week'),
          field('state', 'e', 'vip'),
        ),
      ),
    ).toEqual([
      {
        path: 'root.children.0.fieldKey',
        message:
          '"favouriteColor" is not a field of core:contacts.customers; pick one from segmentFields(contentType: "core:contacts.customers")',
      },
      {
        path: 'root.children.1.operator',
        message:
          '"numberigt" does not apply to Primary email; use e, c, is, ins',
      },
      { path: 'root.children.2.value', message: 'Needs a value' },
      { path: 'root.children.3.value', message: 'Needs a number' },
      {
        path: 'root.children.4.value',
        message: 'vip is not an option of State; use lead, customer',
      },
    ]);
  });

  it('judges a related record by its own catalogue and the measure by numbers', async () => {
    const related = (overrides: Record<string, unknown>) => ({
      kind: 'relation',
      relationKey: 'deals',
      measure: { op: 'sum', fieldKey: 'amount' },
      operator: 'numberigt',
      value: 1000000,
      child: {
        kind: 'field',
        contentType: 'sales:sales.deals',
        fieldKey: 'amount',
        operator: 'numberigt',
        value: 10,
      },
      ...overrides,
    });

    expect(await issuesOf(group(related({})))).toEqual([]);
    expect(
      await issuesOf(
        group(
          related({ relationKey: 'tickets' }),
          related({ measure: { op: 'sum', fieldKey: 'weight' } }),
          related({ value: 'a lot' }),
          related({
            child: { ...related({}).child, contentType: CUSTOMERS },
          }),
        ),
      ),
    ).toEqual([
      {
        path: 'root.children.0.relationKey',
        message:
          '"tickets" is not a relation of core:contacts.customers; pick one from segmentRelations(subjectType: "core:contacts.customers")',
      },
      {
        path: 'root.children.1.measure.fieldKey',
        message: '"weight" is not a field of sales:sales.deals',
      },
      { path: 'root.children.2.value', message: 'Needs a number' },
      {
        path: 'root.children.3.child.contentType',
        message:
          'This condition is about sales:sales.deals, not core:contacts.customers',
      },
    ]);
  });

  it('rejects a node of no known kind', async () => {
    expect(
      await issuesOf(
        group(
          { kind: 'formula', expression: '1' },
          field('primaryEmail', 'is'),
        ),
      ),
    ).toEqual([
      {
        path: 'root.children.0.kind',
        message:
          '"formula" is not a condition kind; use group, field, relation or segment',
      },
    ]);
  });

  it('does not judge a content type whose catalogue cannot be read', async () => {
    expect(
      await findSegmentTreeIssues(
        {
          contentType: 'loyalty:accounts',
          root: group({
            kind: 'field',
            contentType: 'loyalty:accounts',
            fieldKey: 'anything',
            operator: 'e',
            value: 1,
          }),
        },
        catalog,
      ),
    ).toEqual([]);
  });
});

describe('an edited tree', () => {
  it('does not re-judge conditions it already had', async () => {
    const legacy = group(field('removedField', 'e', 'x'));

    expect(
      await issuesOf(
        group(field('removedField', 'e', 'x'), field('primaryEmail', 'is')),
        legacy,
      ),
    ).toEqual([]);
  });

  it('judges the conditions it adds or changes', async () => {
    const before = group(field('primaryEmail', 'c', '@erxes.io'));

    expect(
      await issuesOf(group(field('primaryEmail', 'c', '')), before),
    ).toEqual([{ path: 'root.children.0.value', message: 'Needs a value' }]);
  });

  it('keeps an already empty tree saving, but not one emptied now', async () => {
    expect(await issuesOf(group(), group())).toEqual([]);
    expect(
      await issuesOf(group(), group(field('primaryEmail', 'is'))),
    ).toHaveLength(1);
  });
});

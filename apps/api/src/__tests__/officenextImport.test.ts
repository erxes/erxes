import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vite-plus/test';
import { companyRow, CompanyDocument, uniqueName } from '../../scripts/officenext/companies';
import { finalOf, type Lookups } from '../../scripts/officenext/contacts';
import { customerRow, CustomerDocument, stateOf } from '../../scripts/officenext/customers';
import { fieldRow, FieldDocument, uniqueIn } from '../../scripts/officenext/fields';
import { rowsOfRecord, valuesOf } from '../../scripts/officenext/fieldValues';
import { reasonOf } from '../../scripts/officenext/leftOut';
import { ProductDocument, productRow } from '../../scripts/officenext/products';
import { roleKey } from '../../scripts/officenext/roles';
import { tagTypeOf } from '../../scripts/officenext/tags';
import { placeUnits, uniqueCode } from '../../scripts/officenext/units';
import { roleOf, UserDocument, userRow } from '../../scripts/officenext/users';

// Old erxes documents as Mongo returns them: `_id`, ObjectIds and loose types.
const found: Lookups = {
  members: new Set(['u1']),
  tags: new Map(),
  stages: new Map([
    ['new', 'stage-new'],
    ['disqualified', 'stage-out'],
  ]),
};

describe('officenext import: members, units and roles', () => {
  it('keeps the old password hash and lets only people with an email sign in', () => {
    const person = UserDocument.parse({
      _id: 'u1',
      email: ' Saraa@Nomad.MN ',
      password: '$2a$10$hash',
      isActive: true,
      details: { fullName: 'Saraa Bold' },
    });

    const bot = UserDocument.parse({ _id: 'u2', email: 'bot@nomad.mn', role: 'system' });
    const row = userRow(person, 'member');

    expect([row[1], row[3], row[6], row[7], row[18]]).toEqual([
      'saraa@nomad.mn',
      'Saraa Bold',
      'active',
      '$2a$10$hash',
      true,
    ]);
    expect([userRow(bot, 'member')[6], userRow(bot, 'member')[18]]).toEqual(['disabled', false]);
  });

  it('takes the member role from old roles, the owner flag, then the user group', () => {
    const groups = new Map([['g1', 'r_g10000']]);
    const member = UserDocument.parse({ _id: 'u3', groupIds: ['g0', 'g1'] });
    const owner = UserDocument.parse({ _id: 'u4', isOwner: true, groupIds: ['g1'] });

    expect(roleOf(member, null, groups)).toBe('r_g10000');
    expect(roleOf(owner, null, groups)).toBe('admin');
    expect(roleOf(owner, 'owner', groups)).toBe('owner');
    expect(roleOf(UserDocument.parse({ _id: 'u5' }), null, groups)).toBe('member');
    expect(roleKey('g1')).toBe('r_g10000');
    expect(roleKey('5f1-c2.d')).toBe('r_5f1c2d');
  });

  it('puts units with a missing, looping or other-kind parent at the top', () => {
    const { paths, orphans } = placeUnits([
      { id: 'hq', kind: 'department', parentId: null },
      { id: 'sales', kind: 'department', parentId: 'hq' },
      { id: 'team', kind: 'department', parentId: 'sales' },
      { id: 'shop', kind: 'branch', parentId: 'sales' },
      { id: 'a', kind: 'branch', parentId: 'b' },
      { id: 'b', kind: 'branch', parentId: 'a' },
    ]);

    expect(paths.get('team')).toBe('/hq/sales/team/');
    expect(paths.get('shop')).toBe('/shop/');
    expect(orphans).toContain('shop');
    expect(orphans.size).toBe(2);

    const taken = new Set(['department:hq']);

    expect(uniqueCode(taken, 'department', 'HQ')).toBe('HQ-2');
    expect(uniqueCode(taken, 'branch', 'HQ')).toBe('HQ');
  });

  it('makes untyped tags customer tags and leaves plugin tags to the plugin', () => {
    expect(tagTypeOf(null)).toBe('customer');
    expect(tagTypeOf('contacts:company')).toBe('company');
    expect(tagTypeOf('cards:deal')).toEqual({ skip: 'plugin:sales (cards:deal)' });
    expect(tagTypeOf('mystery:thing')).toEqual({
      skip: 'no core or plugin place for mystery:thing',
    });
  });

  it('says which plugin owns a collection that stays out', () => {
    expect(reasonOf('erxes', 'deals')).toBe('plugin:sales');
    expect(reasonOf('erxes', 'operation_tasks')).toBe('plugin:operation');
    expect(reasonOf('erxes', 'customers_facebooks')).toMatch(
      /^channel integrations: plugin:frontline/,
    );
    expect(reasonOf('erxes_mastra_memory', 'mastra_threads')).toBe(
      'plugin:agent (not in this migration)',
    );
    expect(reasonOf('erxes', 'brand_new_thing')).toBe('no core table or plugin known for it');
  });
});

describe('officenext import: customers and companies', () => {
  it('follows merge chains to the record kept, and stops on a loop', () => {
    const direct = new Map([
      ['a', 'b'],
      ['b', 'c'],
      ['x', 'y'],
      ['y', 'x'],
    ]);

    expect(finalOf(direct, 'a')).toBe('c');
    expect(['x', 'y']).toContain(finalOf(direct, 'x'));
  });

  it('turns visitors into website leads and refuses unknown states', () => {
    expect(stateOf('visitor')).toEqual({ state: 'lead', source: 'website' });
    expect(stateOf(null)).toEqual({ state: 'customer', source: null });
    expect(stateOf('alien')).toBeUndefined();
  });

  it('keeps an email another customer holds as primary only in the list', () => {
    const id = new ObjectId();

    const customer = CustomerDocument.parse({
      _id: id,
      state: 'lead',
      primaryEmail: 'Bat@Nomad.mn',
      emails: ['bat@nomad.mn', 'b@gmail.com'],
      primaryPhone: '(+976) 9911-2233',
      sex: 7,
      leadStatus: 'badTiming',
      ownerId: 'gone',
    });

    const taken = { emails: new Map([['bat@nomad.mn', 'other']]), phones: new Map() };
    const built = customerRow(customer, found, taken, ['old1']);

    expect(built.demotedEmail).toBe(true);
    expect(built.unknownSex).toBe(true);
    expect([built.row[0], built.row[1], built.row[6], built.row[7], built.row[8]]).toEqual([
      id.toHexString(),
      'lead',
      null,
      ['bat@nomad.mn', 'b@gmail.com'],
      '+97699112233',
    ]);
    expect([built.row[10], built.row[16], built.row[19], built.row[21], built.row[22]]).toEqual([
      null,
      null,
      ['old1'],
      'stage-out',
      'Bad timing',
    ]);
    expect(taken.phones.get('+97699112233')).toBe(id.toHexString());
  });

  it('gives a company whose name is taken its code, and keeps the parent in details', () => {
    const company = CompanyDocument.parse({
      _id: 'c1',
      primaryName: 'Nomad LLC',
      code: 'N-01',
      industry: ['Retail'],
      size: 12.4,
      parentCompanyId: 'c0',
      leadStatus: 'new',
    });

    const taken = new Map([['nomad llc', 'c9']]);
    const name = uniqueName(taken, company);
    const row = companyRow(company, found, name, []);

    expect(name).toBe('Nomad LLC (N-01)');
    expect([row[1], row[2], row[9], row[10], row[19], row[20]]).toEqual([
      'Nomad LLC (N-01)',
      ['Nomad LLC (N-01)', 'Nomad LLC'],
      'Retail',
      12,
      'lead',
      'stage-new',
    ]);
    expect(JSON.parse(String(row[23]))).toEqual({ importedFrom: 'erxes 3', parentCompanyId: 'c0' });
  });
});

describe('officenext import: products and custom fields', () => {
  it('archives deleted products and moves prices to the smallest unit', () => {
    const product = ProductDocument.parse({
      _id: 'p1',
      name: 'Airag',
      type: 'service',
      status: 'deleted',
      unitPrice: '12500.5',
      uomId: 'uom1',
      categoryId: 'gone',
    });

    const context = {
      currency: 'MNT',
      units: new Map([['uom1', 'litre']]),
      categories: new Set<string>(),
    };

    const row = productRow(product, context, null, null, []);

    expect([row[1], row[2], row[6], row[8], row[9], row[10]]).toEqual([
      'service',
      'archived',
      null,
      'litre',
      1_250_050,
      'MNT',
    ]);
    expect(row[14]).toBeInstanceOf(Date);
  });

  it('numbers a repeated label and keeps option labels', () => {
    const doc = FieldDocument.parse({
      _id: 'f1',
      text: 'Size',
      code: 'size',
      type: 'select',
      contentType: 'tasks:task',
      groupId: 'g-gone',
      options: ['S', { label: 'Large', value: 'L' }],
      configs: { isRequired: true },
    });

    const taken = { labels: new Set(['operation.task:size']), codes: new Set<string>() };

    const row = fieldRow(
      doc,
      'operation.task',
      { type: 'select', validation: null },
      taken,
      new Set(),
    );

    expect([row[2], row[3], row[4], row[6], row[7], row[13]]).toEqual([
      'Size 2',
      'select',
      ['S', 'Large'],
      null,
      'size',
      true,
    ]);
    expect(uniqueIn(taken.labels, 'operation.task', 'Size')).toBe('Size 3');
  });

  it('types values by the field and prefers customFieldsData over propertiesData', () => {
    const select = { type: 'select', labels: new Map([['L', 'Large']]) };

    expect(valuesOf(select, ['L', 'S', ''])).toEqual([{ text: 'Large' }, { text: 'S' }]);
    expect(valuesOf({ type: 'number', labels: new Map() }, '42')).toEqual([{ number: 42 }]);
    expect(valuesOf({ type: 'number', labels: new Map() }, 'many')).toEqual([]);
    expect(valuesOf({ type: 'date', labels: new Map() }, '2024-03-05T10:00:00Z')).toEqual([
      { date: '2024-03-05' },
    ]);

    const built = rowsOfRecord(
      'c1',
      {
        propertiesData: [
          ['f1', 'S'],
          ['f-gone', 'x'],
        ],
        customFieldsData: [{ field: 'f1', value: 'L' }],
        trackedData: [{ field: 'plan', value: 'pro' }],
      },
      new Map([['f1', select]]),
      new Map([['plan', 'tracked_customer_plan']]),
    );

    expect(built.missing).toEqual(['f-gone']);
    expect(built.rows).toEqual([
      ['c1', 'f1', 0, 'Large', null, null],
      ['c1', 'tracked_customer_plan', 0, 'pro', null, null],
    ]);
  });
});

import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vite-plus/test';
import { customerFor, loginsOf, PortalUser } from '../../scripts/officenext/clientPortal';
import { companyRow, CompanyDocument, uniqueName } from '../../scripts/officenext/companies';
import { contactPair, pairReason, relationLink } from '../../scripts/officenext/conformities';
import { finalOf, type Lookups } from '../../scripts/officenext/contacts';
import { customerRow, CustomerDocument, stateOf } from '../../scripts/officenext/customers';
import { reasonOf } from '../../scripts/officenext/leftOut';
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
  it('reads a customer ↔ company pair either way round and leaves deal pairs to Sales', () => {
    expect(
      contactPair({
        mainType: 'company',
        mainTypeId: 'co1',
        relType: 'customer',
        relTypeId: 'cu1',
      }),
    ).toEqual({ customerId: 'cu1', companyId: 'co1' });
    expect(pairReason('deal', 'customer')).toBe('plugin:sales (deal ↔ customer)');
    expect(pairReason('user', 'task')).toBe('plugin:operation (user ↔ task)');
    expect(pairReason(null, null)).toBe('no place for ? ↔ ?');
    expect(pairReason('operation:project', 'customer')).toBe(
      'plugin:operation (operation:project ↔ customer)',
    );
  });

  it('reads a later two-record relation as a pair, and nothing else', () => {
    expect(
      relationLink({
        entities: [
          { contentType: 'core:customer', contentId: 'cu1' },
          { contentType: 'core:company', contentId: 'co1' },
        ],
      }),
    ).toEqual({ mainType: 'customer', mainTypeId: 'cu1', relType: 'company', relTypeId: 'co1' });
    expect(relationLink({ entities: [{ contentType: 'core:customer', contentId: 'cu1' }] })).toBe(
      null,
    );
    expect(relationLink({ entities: 'broken' })).toBe(null);
  });

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

  it('joins a portal user to the customer with its email, and signs it in by verified addresses', () => {
    const known = {
      ids: new Set(['cu1']),
      byEmail: new Map([['saraa@nomad.mn', 'cu1']]),
      byPhone: new Map<string, string>(),
    };

    const user = PortalUser.parse({
      _id: 'cp1',
      email: 'Saraa@Nomad.mn',
      phone: '9911 2233',
      erxesCustomerId: 'merged-away',
      isEmailVerified: true,
      isPhoneVerified: false,
    });

    const stranger = PortalUser.parse({ _id: 'cp2', phone: '8800-1122', isPhoneVerified: true });

    expect(customerFor(user, known)).toMatchObject({ id: 'cu1', create: false });
    expect(customerFor(stranger, known)).toMatchObject({
      id: 'cp2',
      create: true,
      phone: '88001122',
    });
    expect(loginsOf(user, 'cu1').map((row) => row.slice(0, 4))).toEqual([
      ['cp1-email', 'cu1', 'email', 'saraa@nomad.mn'],
    ]);
    expect(loginsOf(stranger, 'cp2').map((row) => row[3])).toEqual(['88001122']);
  });
});

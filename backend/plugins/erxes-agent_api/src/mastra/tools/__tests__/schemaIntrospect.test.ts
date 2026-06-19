/**
 * Field-selection logic: chooseResponseFields (agent-requested fields, validated
 * against the schema, with one level of nesting + auto-expand) and
 * describeSelectableFields (the menu surfaced in search results). Pure functions,
 * no mocks — exercised against a small hand-built introspection map.
 */
import {
  chooseResponseFields,
  describeSelectableFields,
  type GqlFieldDef,
  type GqlTypeRef,
} from '../schemaIntrospect';

const scalar = (name = 'String'): GqlTypeRef => ({ kind: 'SCALAR', name });
const object = (name: string): GqlTypeRef => ({ kind: 'OBJECT', name });
const listOf = (name: string): GqlTypeRef => ({
  kind: 'LIST',
  ofType: object(name),
});

const objectFieldsMap: Record<string, GqlFieldDef[]> = {
  Deal: [
    { name: '_id', type: scalar() },
    { name: 'name', type: scalar() },
    { name: 'amount', type: { kind: 'SCALAR', name: 'Float' } },
    { name: 'stageId', type: scalar() },
    { name: 'status', type: { kind: 'ENUM', name: 'DealStatus' } },
    { name: 'customer', type: object('Customer') },
  ],
  Customer: [
    { name: '_id', type: scalar() },
    { name: 'name', type: scalar() },
    { name: 'email', type: scalar() },
    { name: 'primaryPhone', type: scalar() },
  ],
  DealListResponse: [
    { name: 'list', type: listOf('Deal') },
    { name: 'totalCount', type: { kind: 'SCALAR', name: 'Int' } },
  ],
};

const DEAL = object('Deal');
const DEAL_LIST = object('DealListResponse');

describe('chooseResponseFields — agent-requested fields', () => {
  it('selects requested top-level scalars and always prepends _id', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'name',
      'amount',
    ]);
    expect(sel).toBe('_id name amount');
  });

  it('drops unknown field names but keeps the valid ones', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'name',
      'bogus',
      'amount',
    ]);
    expect(sel).toBe('_id name amount');
  });

  it('groups one level of nested children under their parent object', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'name',
      'customer.email',
      'customer.name',
    ]);
    expect(sel).toBe('_id name customer { email name }');
  });

  it('auto-expands a bare object field to its default leaves', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'customer',
    ]);
    expect(sel).toBe('_id customer { _id name email primaryPhone }');
  });

  it('drops paths deeper than one level', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'name',
      'customer.address.city',
    ]);
    expect(sel).toBe('_id name');
  });

  it('falls back to the auto selection when every requested field is invalid', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap, [
      'bogus',
      'nope',
    ]);
    // Auto selection = Deal's scalar/enum leaves (object `customer` excluded).
    expect(sel).toBe('_id name amount stageId status');
  });

  it('applies requested fields to the inner item type for list wrappers', () => {
    const sel = chooseResponseFields(
      'deals',
      undefined,
      DEAL_LIST,
      objectFieldsMap,
      ['name', 'amount'],
    );
    expect(sel).toBe('list { _id name amount } totalCount');
  });

  it('ignores requested fields for the curated dealsAdd selection', () => {
    const sel = chooseResponseFields('dealsAdd', undefined, DEAL, objectFieldsMap, [
      'amount',
    ]);
    expect(sel).toBe('_id name stageId');
  });

  it('still auto-selects when no fields are requested', () => {
    const sel = chooseResponseFields('deals', undefined, DEAL, objectFieldsMap);
    expect(sel).toBe('_id name amount stageId status');
  });
});

describe('describeSelectableFields — search field menu', () => {
  it('lists leaf fields and one level of nested children for a plain object', () => {
    const menu = describeSelectableFields(DEAL, objectFieldsMap);
    expect(menu).toEqual({
      type: 'Deal',
      isList: false,
      fields: ['_id', 'name', 'amount', 'stageId', 'status'],
      nested: { customer: ['_id', 'name', 'email', 'primaryPhone'] },
    });
  });

  it('describes the inner item type for a list wrapper', () => {
    const menu = describeSelectableFields(DEAL_LIST, objectFieldsMap);
    expect(menu?.type).toBe('Deal');
    expect(menu?.isList).toBe(true);
    expect(menu?.fields).toContain('amount');
  });

  it('returns undefined when the return type is not introspectable', () => {
    expect(describeSelectableFields(object('Unknown'), objectFieldsMap)).toBeUndefined();
    expect(describeSelectableFields(DEAL, undefined)).toBeUndefined();
  });
});

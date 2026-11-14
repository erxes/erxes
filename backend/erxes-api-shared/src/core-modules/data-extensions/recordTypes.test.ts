import { DATA_EXTENSION_RECORD_TYPES } from './recordTypes';

const byName = (recordType: string) =>
  DATA_EXTENSION_RECORD_TYPES.find(
    (descriptor) => descriptor.recordType === recordType,
  );

describe('record type screen metadata', () => {
  it('names the screens of every record type', () => {
    for (const descriptor of DATA_EXTENSION_RECORD_TYPES) {
      expect(descriptor.contentTypes.length).toBeGreaterThan(0);
    }
  });

  it('shows scoped types on the screens of the documents they live on', () => {
    expect(byName('core:lead')?.contentTypes).toEqual(['core:customer']);
    expect(byName('core:vendor')?.contentTypes).toEqual([
      'core:company',
      'core:customer',
    ]);
    expect(byName('core:teamMember')?.contentTypes).toEqual(['core:user']);
  });

  it('maps create mutations to the record types they create', () => {
    const creators = DATA_EXTENSION_RECORD_TYPES.filter(
      (descriptor) => descriptor.createMutations?.length,
    ).map(({ recordType, createMutations }) => [recordType, createMutations]);

    expect(creators).toEqual([
      ['core:company', ['companiesAdd']],
      ['core:customer', ['customersAdd']],
      ['core:lead', ['customersAdd']],
      ['operation:task', ['createTask']],
      ['operation:project', ['createProject']],
      ['core:product', ['productsAdd']],
      ['sales:deal', ['dealsAdd']],
      ['frontline:ticket', ['createTicket']],
    ]);
  });

  it('never lets two owners claim the same create mutation', () => {
    const ownerByMutation = new Map<string, string>();

    for (const { owner, createMutations = [] } of DATA_EXTENSION_RECORD_TYPES) {
      for (const mutation of createMutations) {
        expect(ownerByMutation.get(mutation) ?? owner).toBe(owner);
        ownerByMutation.set(mutation, owner);
      }
    }
  });
});

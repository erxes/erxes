import { parse, print } from 'graphql';
import * as account from '../schemas/account';
import * as vat from '../schemas/vatRow';
import * as ctax from '../schemas/ctaxRow';
import * as adjustment from '../schemas/adjustInvDetail';
import * as transactions from '../schemas/transactionCommon';
import * as inventory from '../schemas/inventories';
import * as safeItems from '../../../inventories/graphql/schemas/safeRemainderItem';

jest.mock('erxes-api-shared/utils', () => ({
  GQL_CURSOR_PARAM_DEFS: '',
  GQL_PAGE_INFO: '',
}));

const argumentType = (
  fields: string,
  fieldName: string,
  argumentName: string,
) => {
  const definition = parse(`type Query { ${fields} }`).definitions[0];
  if (definition.kind !== 'ObjectTypeDefinition')
    throw new Error('Expected object definition');
  const field = definition.fields?.find(
    (item) => item.name.value === fieldName,
  );
  const argument = field?.arguments?.find(
    (item) => item.name.value === argumentName,
  );
  return argument ? print(argument.type) : undefined;
};

describe('accounting input contracts', () => {
  it.each([
    [account.queries, 'accountDetail'],
    [vat.queries, 'vatRowDetail'],
    [ctax.queries, 'ctaxRowDetail'],
    [adjustment.queries, 'adjustInventoryDetail'],
    [safeItems.mutations, 'safeRemainderItemEdit'],
  ])('requires the lookup id for %s / %s', (fields, operation) => {
    expect(argumentType(fields, operation, '_id')).toBe('String!');
  });

  it('links exactly the trIds declared by the mutation', () => {
    expect(
      argumentType(transactions.mutations, 'accTransactionsLink', 'trIds'),
    ).toBe('[String!]!');
    expect(
      argumentType(transactions.mutations, 'accTransactionsLink', 'ptrId'),
    ).toBe('String!');
    expect(
      argumentType(transactions.mutations, 'accTransactionsLink', 'ids'),
    ).toBeUndefined();
  });

  it('requires transaction batches and the update parent', () => {
    expect(
      argumentType(transactions.mutations, 'accTransactionsCreate', 'trDocs'),
    ).toBe('[TransactionInput!]!');
    expect(
      argumentType(transactions.mutations, 'accTransactionsUpdate', 'parentId'),
    ).toBe('String!');
  });

  it('exposes inventory costs as typed rows instead of JSON', () => {
    expect(inventory.queries).toContain('[AccCurrentCost!]!');
    expect(inventory.queries).toContain('[AccountingLastIncomePrice!]!');
  });
});

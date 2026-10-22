import { gql } from '@apollo/client';
import { buildSchema, print, validate } from 'graphql';
import {
  builtinModelUpdateDocument,
  withBuiltinModelFields,
} from '../builtinDocuments';
import { field } from './fixtures';

const schema = buildSchema(`
  type Customer { _id: String! firstName: String test: String _dataModelVersion: Int }
  type CustomerList { list: [Customer!]! totalCount: Int! }
  type Query { customers: CustomerList! customerDetail(_id: String!): Customer }
`);

it('adds metadata fields to the normal customer list without replacing its business root or operation', () => {
  const base = gql`
    query contactsCustomersWithFields {
      customers {
        list {
          _id
          firstName
        }
        totalCount
      }
    }
  `;
  const document = withBuiltinModelFields(
    base,
    'customer',
    [field({ name: 'test' })],
    [['customers', 'list']],
  );
  expect(validate(schema, document)).toEqual([]);
  const query = print(document);
  expect(query).toContain('query contactsCustomersWithFields');
  expect(query).toContain('customers {');
  expect(query).toContain('firstName');
  expect(query).toContain('test');
  expect(query).toContain('_dataModelVersion');
  expect(query).not.toContain('dataModel_customerFields');
});

it('preserves business aliases, arguments, directives and fragments', () => {
  const base = gql`
    query contactsCustomerAliases($id: String!, $show: Boolean!) {
      person: customerDetail(_id: $id) @include(if: $show) {
        ...contactsCustomerIdentity
      }
    }
    fragment contactsCustomerIdentity on Customer {
      _id
      firstName
    }
  `;
  const document = withBuiltinModelFields(
    base,
    'customer',
    [field({ name: 'test' })],
    [['customerDetail']],
  );
  expect(validate(schema, document)).toEqual([]);
  expect(print(document)).toContain(
    'person: customerDetail(_id: $id) @include(if: $show)',
  );
  expect(print(document)).toContain('...contactsCustomerIdentity');
});

it('leaves ordinary requests unchanged when no active model fields exist', () => {
  const base = gql`
    query contactsCustomerWithoutFields {
      customers {
        list {
          _id
        }
      }
    }
  `;
  expect(
    withBuiltinModelFields(base, 'customer', [], [['customers', 'list']]),
  ).toBe(base);
  expect(
    withBuiltinModelFields(
      base,
      'customer',
      [field({ archivedAt: '2026-10-23' })],
      [['customers', 'list']],
    ),
  ).toBe(base);
});

it('does not duplicate explicitly selected fields or change their directives', () => {
  const base = gql`
    query contactsCustomerFieldDirective($hide: Boolean!) {
      customers {
        list {
          _id
          test @skip(if: $hide)
        }
      }
    }
  `;
  const document = withBuiltinModelFields(
    base,
    'customer',
    [field({ name: 'test' })],
    [['customers', 'list']],
  );
  expect(validate(schema, document)).toEqual([]);
  expect(print(document).match(/\btest\b/g)).toHaveLength(1);
});

it('uses typed built-in writes and rejects invalid metadata identifiers', () => {
  const query = print(
    builtinModelUpdateDocument('customer', [field({ name: 'test' })]),
  );
  expect(query).toContain('$input: DataModel_customerUpdateInput!');
  expect(query).toContain('expectedVersion: $expectedVersion');
  expect(() =>
    builtinModelUpdateDocument('customer', [field({ name: 'bad { name' })]),
  ).toThrow('Invalid model field identity');
});

import { buildSchema, parse } from 'graphql';
import { extractGraphqlReferences } from '@/agents/graphqlReferences';

const schema = buildSchema(`
  type Customer { _id: ID!, firstName: String }
  type CustomerPage { list: [Customer!]! }
  type Query { customers: CustomerPage }
`);

it('emits record links from aliased GraphQL results and list wrappers', () => {
  expect(
    extractGraphqlReferences(
      schema,
      parse(`query Find {
    people: customers { list { ...Person } }
  } fragment Person on Customer { _id firstName }`),
      {
        people: { list: [{ _id: 'c1', firstName: 'Jane' }] },
      },
    ),
  ).toEqual(['[[customer:c1:Jane]]']);
});

it('never invents ids for missing or invalid records', () => {
  expect(
    extractGraphqlReferences(
      schema,
      parse('query Find { customers { list { _id firstName } } }'),
      {
        customers: { list: [{ firstName: 'Jane' }, { _id: '../invalid' }] },
      },
    ),
  ).toEqual([]);
});

it('derives ids and names from their real fields when scalar aliases are used', () => {
  expect(
    extractGraphqlReferences(
      schema,
      parse('query { customers { list { actual: _id display: firstName } } }'),
      { customers: { list: [{ actual: 'c1', display: 'Jane' }] } },
    ),
  ).toEqual(['[[customer:c1:Jane]]']);
});
it('never treats a non-identity field aliased as _id as a real record id', () => {
  expect(
    extractGraphqlReferences(
      schema,
      parse('query { customers { list { _id: firstName } } }'),
      { customers: { list: [{ _id: 'pretend-id' }] } },
    ),
  ).toEqual([]);
});
it('does not confuse the record type through an incompatible inline fragment', () => {
  const typed = buildSchema(
    'interface Item { _id: ID! } type Customer implements Item { _id: ID! firstName: String } type Company implements Item { _id: ID! primaryName: String } type Query { item: Item }',
  );
  const document = parse(
    'query { item { __typename _id ... on Customer { firstName } ... on Company { primaryName } } }',
  );
  expect(
    extractGraphqlReferences(typed, document, {
      item: { __typename: 'Company', _id: 'company-1', primaryName: 'Acme' },
    }),
  ).toEqual(['[[company:company-1:Acme]]']);
});

it('never derives a second record type from an operation that was not executed', () => {
  const typed = buildSchema(
    'type Customer { _id: ID! firstName: String } type Company { _id: ID! primaryName: String } type Query { customer: Customer company: Company }',
  );
  const query = parse(
    'query Person { result: customer { _id } } query Business { result: company { _id } }',
  );
  expect(
    extractGraphqlReferences(typed, query, { result: { _id: 'c1' } }, 'Person'),
  ).toEqual(['[[customer:c1:c1]]']);
  expect(
    extractGraphqlReferences(typed, query, { result: { _id: 'c1' } }),
  ).toEqual([]);
});

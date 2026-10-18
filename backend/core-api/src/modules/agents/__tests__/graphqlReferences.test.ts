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

import { buildSchema, graphql } from 'graphql';
import { mutations, types } from '../job';

const schema = buildSchema(`
  scalar Date
  scalar JSON
  type Product { _id: String! }
  type Query { noop: String }
  ${types}
  type Mutation { ${mutations} }
`);

test.each([
  ['jobAdd', 'inputs'],
  ['jobAdd', 'outputs'],
  ['jobEdit', 'inputs'],
  ['jobEdit', 'outputs'],
])(
  '%s rejects null %s rows before invoking the resolver',
  async (operation, field) => {
    const resolver = jest.fn();
    const args = [
      'name: "Job"',
      ...(operation === 'jobEdit' ? ['_id: "job"'] : []),
      `inputs: ${
        field === 'inputs' ? '$items' : '[{productId: "raw", quantity: 1}]'
      }`,
      `outputs: ${
        field === 'outputs'
          ? '$items'
          : '[{productId: "finished", quantity: 1, costRatio: 1}]'
      }`,
    ];
    const result = await graphql({
      schema,
      source: `mutation AccountingJobNullRows($items: [JobItemInput!]!) {
      ${operation}(${args.join(', ')}) { _id }
    }`,
      variableValues: { items: [null] },
      rootValue: { [operation]: resolver },
    });
    expect(result.errors?.[0].message).toContain('JobItemInput!');
    expect(resolver).not.toHaveBeenCalled();
  },
);

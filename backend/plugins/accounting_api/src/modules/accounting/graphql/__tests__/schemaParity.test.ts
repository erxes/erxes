import { buildSubgraphSchema } from '@apollo/subgraph';
import resolvers from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';

test('every accounting root field has a resolver and every resolver is declared', async () => {
  const schema = buildSubgraphSchema({ typeDefs: await typeDefs(), resolvers });
  for (const [rootType, rootResolvers] of [
    [schema.getQueryType(), resolvers.Query],
    [schema.getMutationType(), resolvers.Mutation],
  ] as const) {
    const schemaFields = Object.keys(rootType?.getFields() ?? {})
      .filter((name) => !name.startsWith('_'))
      .sort();
    expect(Object.keys(rootResolvers).sort()).toEqual(schemaFields);
  }
});

test('the deprecated odd-transactions field preserves its legacy null result', async () => {
  const schema = buildSubgraphSchema({ typeDefs: await typeDefs(), resolvers });
  const field = schema.getQueryType()?.getFields().accOddTransactions;
  expect(field?.deprecationReason).toBeDefined();
  expect(field?.resolve?.(null, {}, {}, {} as never)).toBeNull();
});

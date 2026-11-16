import { buildSubgraphSchema } from '@apollo/subgraph';
import { graphql, GraphQLSchema } from 'graphql';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from '~/apollo/resolvers';

let schema: GraphQLSchema;
beforeAll(async () => {
  schema = buildSubgraphSchema({ typeDefs: await typeDefs(), resolvers });
});
test.each([
  ['query { accountingTunableReports { totalCount } }', 'readTunableReports'],
  [
    'query { accountingTunableReportGenerate(_id: "r", fromDate: "2026-01-01", toDate: "2026-12-31") { cells { value } } }',
    'readTunableReports',
  ],
  [
    'query { accountingTunableReportDetail(_id: "r") { _id } }',
    'readTunableReports',
  ],
  [
    'mutation { accountingTunableReportSave(input: { code: "R", name: "R", sections: [] }) { _id } }',
    'manageTunableReports',
  ],
  [
    'mutation { accountingTunableReportRemove(_id: "r", expectedVersion: 1) }',
    'removeTunableReports',
  ],
])('checks permission before model access: %s', async (source, permission) => {
  const access = jest.fn();
  const checkPermission = jest
    .fn()
    .mockRejectedValue(new Error('Permission denied'));
  const result = await graphql({
    schema,
    source,
    contextValue: {
      checkPermission,
      models: new Proxy({}, { get: access }),
      user: { _id: 'member' },
    },
  });
  expect(checkPermission).toHaveBeenCalledWith(permission);
  expect(access).not.toHaveBeenCalled();
  expect(result.errors?.[0].message).toBe('Permission denied');
});

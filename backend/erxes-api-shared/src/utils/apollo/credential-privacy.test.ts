import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import * as Sentry from '@sentry/node';
import { logHandler } from '../logs';
import { getPlugin, getPlugins } from '../service-discovery';
import { sendCoreModuleProducer } from '../trpc/sendCoreModuleProducer';
import { checkBeforeResolvers, runBeforeResolvers } from './runBeforeResolvers';
import { wrapApolloResolvers } from './wrapperResolvers';
import { wrapApolloMutations } from './wrapperMutations';

jest.mock('../logs', () => ({
  logHandler: jest.fn(async (resolve: () => unknown) => resolve()),
}));
jest.mock('../service-discovery', () => ({
  getPlugin: jest.fn(),
  getPlugins: jest.fn(async () => []),
}));
jest.mock('../trpc/sendCoreModuleProducer', () => ({
  sendCoreModuleProducer: jest.fn(),
}));
jest.mock('../../core-modules/permissions/utils', () => ({
  wrapPermission: (resolver: unknown) => resolver,
  wrapPublicResolver: (resolver: unknown) => resolver,
}));
jest.mock('@sentry/node', () => ({
  withScope: jest.fn(),
  captureException: jest.fn(),
}));

const input = { value: 'synthetic-private-value' };
const context = {
  subdomain: 'tenant-a',
  req: { headers: {} },
  user: { _id: 'user-a' },
};

afterEach(() => jest.clearAllMocks());

describe('vault resolver observability boundary', () => {
  it('never sends vault arguments to optional plugin extension hooks', async () => {
    expect(
      await runBeforeResolvers('credentialsCreate', input, context),
    ).toEqual({ resolved: false, args: input });
    expect(
      await checkBeforeResolvers('credentialsGrantCreate', input, context),
    ).toEqual({ available: true, args: input, blocked: [] });
    expect(getPlugins).not.toHaveBeenCalled();
    expect(getPlugin).not.toHaveBeenCalled();
    expect(sendCoreModuleProducer).not.toHaveBeenCalled();
  });

  it.each(['core resolver wrapper', 'legacy mutation wrapper'])(
    'skips argument/result logging through %s',
    async (kind) => {
      const resolver = async () => 'synthetic-issued-token';
      const wrapped =
        kind === 'core resolver wrapper'
          ? wrapApolloResolvers({
              Mutation: { credentialsGrantCreate: resolver },
            }).Mutation
          : wrapApolloMutations({ credentialsGrantCreate: resolver });
      const mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          credentialsGrantCreate: {
            type: GraphQLString,
            args: { value: { type: GraphQLString } },
            resolve: wrapped.credentialsGrantCreate,
          },
        },
      });
      const query = new GraphQLObjectType({
        name: 'Query',
        fields: { ordinary: { type: GraphQLString } },
      });
      const result = await graphql({
        schema: new GraphQLSchema({ query, mutation }),
        source:
          'mutation Ordinary($value: String) { alias: credentialsGrantCreate(value: $value) }',
        variableValues: input,
        contextValue: context,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.alias).toBe('synthetic-issued-token');
      expect(logHandler).not.toHaveBeenCalled();
      expect(sendCoreModuleProducer).not.toHaveBeenCalled();
    },
  );

  it('never captures a vault resolver exception in Sentry', async () => {
    const wrapped = wrapApolloResolvers({
      Mutation: {
        credentialsCreate: async () => {
          throw new Error(input.value);
        },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { ordinary: { type: GraphQLString } },
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          credentialsCreate: {
            type: GraphQLString,
            resolve: wrapped.Mutation.credentialsCreate,
          },
        },
      }),
    });
    const result = await graphql({
      schema,
      source: 'mutation { credentialsCreate }',
      contextValue: context,
    });
    expect(result.errors).toHaveLength(1);
    expect(Sentry.withScope).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(logHandler).not.toHaveBeenCalled();
  });

  it('retains the existing logger for ordinary mutations', async () => {
    const wrapped = wrapApolloResolvers({
      Mutation: { configsEdit: async () => 'ordinary-result' },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { ordinary: { type: GraphQLString } },
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          configsEdit: {
            type: GraphQLString,
            resolve: wrapped.Mutation.configsEdit,
          },
        },
      }),
    });
    const result = await graphql({
      schema,
      source: 'mutation { configsEdit }',
      contextValue: context,
    });
    expect(result.errors).toBeUndefined();
    expect(logHandler).toHaveBeenCalledTimes(1);
    expect(getPlugins).toHaveBeenCalled();
  });
});

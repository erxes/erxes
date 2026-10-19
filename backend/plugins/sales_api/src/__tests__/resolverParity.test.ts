import { Kind, parse } from 'graphql';
import { queries } from '../apollo/resolvers/queries';
import { mutations } from '../apollo/resolvers/mutations';
import {
  queries as queryFields,
  mutations as mutationFields,
} from '../apollo/schema/schema';

// Keep the actual assembled root registries and SDL; isolate services that
// would otherwise open Redis, workers, or HTTP integrations during import.
jest.mock('erxes-api-shared/utils', () => ({
  GQL_CURSOR_PARAM_DEFS: '',
  markResolvers: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({}));
jest.mock('../modules/pos/utils', () => ({}));
jest.mock('../modules/pos/graphql/resolvers/mutations/utils', () => ({}));
jest.mock(
  '../modules/sales/graphql/resolvers/mutations/loyaltyUtils',
  () => ({}),
);

it.each([
  ['Query', queryFields, queries],
  ['Mutation', mutationFields, mutations],
] as const)(
  'provides exactly the declared %s resolvers',
  (name, fields, resolvers) => {
    const definition = parse(`type ${name} { ${fields} }`).definitions[0];
    if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION) {
      throw new Error('Expected root fields');
    }
    const declared = (definition.fields || []).map((field) => field.name.value);
    expect(Object.keys(resolvers).sort()).toEqual(declared.sort());
    for (const resolver of Object.values(resolvers)) {
      expect(typeof resolver).toBe('function');
    }
  },
);

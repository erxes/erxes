import { Kind, parse } from 'graphql';
import { validateAgentPluginMeta } from 'erxes-api-shared/core-modules';
import { agent } from '../agent';
import {
  queries as queryFields,
  mutations as mutationFields,
} from '../../apollo/schema/schema';

// Schema strings only; the agent contract is checked by the shared validator
// core uses, without loading the rest of the shared core-modules barrel.
jest.mock('erxes-api-shared/utils', () => ({ GQL_CURSOR_PARAM_DEFS: '' }));
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/agent'),
);

const rootFieldNames = (name: string, fields: string): Set<string> => {
  const definition = parse(`type ${name} { ${fields} }`).definitions[0];

  if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION) {
    throw new Error(`${name} did not parse as an object type`);
  }

  return new Set((definition.fields ?? []).map((field) => field.name.value));
};

const queries = rootFieldNames('Query', queryFields);
const mutations = rootFieldNames('Mutation', mutationFields);

describe('sales agent metadata', () => {
  it('registers the pipeline analysis skill without rejections', () => {
    const validated = validateAgentPluginMeta(agent);

    expect(validated.rejections).toEqual([]);
    expect(validated.skills.map(({ name }) => name)).toEqual([
      'pipeline-analysis',
    ]);
  });

  it('points skill hints at real, discoverable sales queries', () => {
    const hidden = new Set(agent.hiddenOperations?.queries);

    for (const operation of agent.skills?.flatMap(
      ({ operations = [] }) => operations,
    ) ?? []) {
      expect(queries.has(operation)).toBe(true);
      expect(hidden.has(operation)).toBe(false);
    }
  });

  it('hides only client portal operations that sales owns', () => {
    const { queries: hiddenQueries = [], mutations: hiddenMutations = [] } =
      agent.hiddenOperations ?? {};

    for (const name of hiddenQueries) {
      expect(queries.has(name)).toBe(true);
    }

    for (const name of hiddenMutations) {
      expect(mutations.has(name)).toBe(true);
    }

    expect(
      [...hiddenQueries, ...hiddenMutations].every((name) =>
        name.startsWith('cp'),
      ),
    ).toBe(true);
  });
});

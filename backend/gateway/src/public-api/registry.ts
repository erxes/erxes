import type { IPublicApiOperation } from 'erxes-api-shared/core-types';
import { getPublicApiOperations } from 'erxes-api-shared/utils';
import { Kind, parse, visit } from 'graphql';

const OPERATION_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*\.v\d+$/;

let operationRegistry: ReadonlyMap<
  string,
  Readonly<IPublicApiOperation>
> = new Map();

/** Validate a published operation before admitting it to the runtime registry. */
const validateOperation = (operation: IPublicApiOperation) => {
  if (!OPERATION_ID_PATTERN.test(operation.id)) {
    throw new Error(`Invalid public API operation id: ${operation.id}`);
  }

  if (!operation.requiredActions.length) {
    throw new Error(
      `Public API operation requires a permission action: ${operation.id}`,
    );
  }

  const document = parse(operation.document);
  const operationDefinitions = document.definitions.filter(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION,
  );

  if (operationDefinitions.length !== 1) {
    throw new Error(
      `Public API operation must contain one operation: ${operation.id}`,
    );
  }

  const [definition] = operationDefinitions;

  if (definition.name?.value !== operation.operationName) {
    throw new Error(`Public API operation name mismatch for ${operation.id}`);
  }

  if (definition.operation !== operation.kind) {
    throw new Error(`Public API operation kind mismatch for ${operation.id}`);
  }

  visit(document, {
    Field(node) {
      if (node.name.value.startsWith('__')) {
        throw new Error(
          `Public API introspection is not allowed: ${operation.id}`,
        );
      }
    },
  });
};

/** Atomically rebuild the runtime registry from active plugin metadata. */
export const refreshPublicApiRegistry = async () => {
  const operations = await getPublicApiOperations();
  const nextRegistry = new Map<string, Readonly<IPublicApiOperation>>();

  for (const operation of operations) {
    validateOperation(operation);

    if (nextRegistry.has(operation.id)) {
      throw new Error(`Duplicate public API operation id: ${operation.id}`);
    }

    nextRegistry.set(
      operation.id,
      Object.freeze({
        ...operation,
        requiredActions: [...operation.requiredActions],
      }),
    );
  }

  operationRegistry = nextRegistry;
};

/** Resolve a published operation by its stable public identifier. */
export const getPublicApiOperation = (operationId: string) =>
  operationRegistry.get(operationId);

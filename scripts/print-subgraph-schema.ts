// Prints the subgraph SDL of a backend service to <root>/generated/schema.graphql,
// offline. Usage, from the repo root:
//   tsx --tsconfig <root>/tsconfig.json scripts/print-subgraph-schema.ts <root>
import { buildSubgraphSchema, printSubgraphSchema } from '@apollo/subgraph';
import {
  DefinitionNode,
  DocumentNode,
  Kind,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  parse,
} from 'graphql';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');

type TypeDefsModule = { typeDefs: () => Promise<DocumentNode> };
type SubscriptionModule = { default: { typeDefs: string } };

const isSubscriptionType = (
  definition: DefinitionNode,
): definition is ObjectTypeDefinitionNode | ObjectTypeExtensionNode =>
  (definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
    definition.kind === Kind.OBJECT_TYPE_EXTENSION) &&
  definition.name.value === 'Subscription';

const main = async () => {
  const typeDefsModule: TypeDefsModule = await import(
    join(root, 'src/apollo/typeDefs')
  );
  const typeDefs = await typeDefsModule.typeDefs();
  const modules = [{ typeDefs }];

  // subscriptions are served by the gateway, but codegen needs their types.
  // Skip fields the subgraph already declares itself (mongolian does).
  if (existsSync(join(root, 'src/apollo/subscription.ts'))) {
    const subscription: SubscriptionModule = await import(
      join(root, 'src/apollo/subscription')
    );
    const declared = new Set(
      typeDefs.definitions.flatMap((definition) =>
        isSubscriptionType(definition)
          ? (definition.fields ?? []).map((field) => field.name.value)
          : [],
      ),
    );
    const fields = parse(
      `type Subscription { ${subscription.default.typeDefs} }`,
    ).definitions.flatMap((definition) =>
      isSubscriptionType(definition)
        ? (definition.fields ?? []).filter(
            (field) => !declared.has(field.name.value),
          )
        : [],
    );

    if (fields.length) {
      modules.push({
        typeDefs: {
          kind: Kind.DOCUMENT,
          definitions: [
            {
              kind: Kind.OBJECT_TYPE_DEFINITION,
              name: { kind: Kind.NAME, value: 'Subscription' },
              fields,
            },
          ],
        },
      });
    }
  }

  mkdirSync(join(root, 'generated'), { recursive: true });
  writeFileSync(
    join(root, 'generated/schema.graphql'),
    printSubgraphSchema(buildSubgraphSchema(modules)),
  );
};

// erxes-api-shared/utils opens Redis on import, so exit explicitly once written
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);

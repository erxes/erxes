// Prints the subgraph SDL of a backend service to <root>/generated/schema.graphql,
// offline. Usage, from the repo root:
//   tsx --tsconfig <root>/tsconfig.json scripts/print-subgraph-schema.ts <root>
import { buildSubgraphSchema, printSubgraphSchema } from '@apollo/subgraph';
import { DocumentNode, parse } from 'graphql';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');

type TypeDefsModule = { typeDefs: () => Promise<DocumentNode> };
type SubscriptionModule = { default: { typeDefs: string } };

const main = async () => {
  const typeDefsModule: TypeDefsModule = await import(
    join(root, 'src/apollo/typeDefs')
  );
  const modules = [{ typeDefs: await typeDefsModule.typeDefs() }];

  // subscriptions are served by the gateway, but codegen needs their types.
  // A field declared here and in the subgraph SDL fails the build.
  if (existsSync(join(root, 'src/apollo/subscription.ts'))) {
    const subscription: SubscriptionModule = await import(
      join(root, 'src/apollo/subscription')
    );
    modules.push({
      typeDefs: parse(`type Subscription { ${subscription.default.typeDefs} }`),
    });
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

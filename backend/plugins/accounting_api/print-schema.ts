import { buildSubgraphSchema } from '@apollo/subgraph';
import { parse, printSchema } from 'graphql';
import { mkdirSync, writeFileSync } from 'node:fs';
import subscription from './src/apollo/subscription';
import { typeDefs } from './src/apollo/typeDefs';

const main = async () => {
  const schema = buildSubgraphSchema([
    { typeDefs: await typeDefs() },
    { typeDefs: parse(`type Subscription { ${subscription.typeDefs} }`) },
  ]);

  mkdirSync('generated', { recursive: true });
  writeFileSync('generated/schema.graphql', printSchema(schema));
};

// Shared utilities initialize Redis connections, so terminate after exporting.
main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error);
    process.exit(1);
  },
);

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

// erxes-api-shared/utils opens Redis on import, so exit explicitly once written
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);

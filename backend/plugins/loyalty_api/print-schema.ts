import { buildSubgraphSchema } from '@apollo/subgraph';
import { printSchema } from 'graphql';
import { mkdirSync, writeFileSync } from 'node:fs';
import { typeDefs } from './src/apollo/typeDefs';

const main = async () => {
  const schema = buildSubgraphSchema([{ typeDefs: await typeDefs() }]);

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

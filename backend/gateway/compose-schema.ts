// Composes the subgraph schemas printed by each service's `schema:print`
// target into generated/schema.graphql, the client-facing schema every
// frontend codegen reads. The router composes the same subgraphs at runtime.
import { composeServices } from '@apollo/composition';
import { parse, printSchema } from 'graphql';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gatewaySubscriptionTypeDefs } from './src/subscription/genTypeDefs';

const backendPath = '..';

const subgraphPaths = [
  { name: 'core', path: `${backendPath}/core-api` },
  ...readdirSync(`${backendPath}/plugins`).map((dir) => ({
    name: dir.replace(/_api$/, ''),
    path: `${backendPath}/plugins/${dir}`,
  })),
].filter(({ path }) => existsSync(`${path}/generated/schema.graphql`));

const { errors, schema } = composeServices([
  ...subgraphPaths.map(({ name, path }) => ({
    name,
    typeDefs: parse(readFileSync(`${path}/generated/schema.graphql`, 'utf-8')),
  })),
  {
    name: 'gateway',
    typeDefs: parse(
      `scalar JSON type Subscription { ${gatewaySubscriptionTypeDefs} }`,
    ),
  },
]);

if (errors) {
  for (const error of errors) {
    console.error(error.message);
  }
  process.exit(1);
}

mkdirSync('generated', { recursive: true });
writeFileSync(
  'generated/schema.graphql',
  printSchema(schema.toAPISchema().toGraphQLJSSchema()),
);
console.log(
  `Composed ${subgraphPaths.map(({ name }) => name).join(', ')} into generated/schema.graphql`,
);

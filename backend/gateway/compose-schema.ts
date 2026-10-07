// Composes the subgraph schemas printed by every backend that opts into the
// `schema:print` Nx target into generated/schema.graphql. This is the
// repo-wide schema frontend codegen checks against: every gateway subgraph
// plus the gateway's own subscription fields. A deployment's router composes
// only the plugins it enables, at runtime.
import { composeServices } from '@apollo/composition';
import { parse, printSchema } from 'graphql';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { gatewaySubscriptionTypeDefs } from './src/subscription/genTypeDefs';

type ProjectJson = { targets?: Record<string, unknown> };

const printsSchema = (path: string) => {
  const project: ProjectJson = JSON.parse(
    readFileSync(`${path}/project.json`, 'utf-8'),
  );
  return 'schema:print' in (project.targets ?? {});
};

const subgraphs = [
  { name: 'core', path: '../core-api' },
  ...readdirSync('../plugins')
    .map((dir) => ({
      name: dir.replace(/_api$/, ''),
      path: `../plugins/${dir}`,
    }))
    .filter(({ path }) => existsSync(`${path}/project.json`)),
].filter(({ path }) => printsSchema(path));

const { errors, schema } = composeServices([
  ...subgraphs.map(({ name, path }) => ({
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
  throw new Error(errors.map((error) => error.message).join('\n'));
}

mkdirSync('generated', { recursive: true });
writeFileSync(
  'generated/schema.graphql',
  printSchema(schema.toAPISchema().toGraphQLJSSchema()),
);
console.log(
  `Composed ${subgraphs
    .map(({ name }) => name)
    .join(', ')} into generated/schema.graphql`,
);

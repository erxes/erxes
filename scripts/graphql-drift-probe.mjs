// Finds declared query arguments that a subgraph's resolvers ignore.
//
//   ERXES_AUTH_TOKEN=<auth-token cookie> node scripts/graphql-drift-probe.mjs <subgraph>
//
// <subgraph> is `core` or a plugin name such as `sales`. Its printed SDL
// (`nx run gateway:schema:compose`) decides which root fields it owns. The
// gateway (ERXES_GATEWAY_URL, default http://localhost:4000) must serve that
// subgraph against a database with data in it.
//
// Every query field with no required arguments and a non-empty result runs once
// without filters, then once per String, ID or date argument with a value that
// should match nothing. An unchanged result means the resolver dropped the
// argument. Reads only. Exits 1 when an argument is ignored.
import { existsSync, readFileSync } from 'node:fs';
import {
  buildClientSchema,
  getIntrospectionQuery,
  getNamedType,
  getNullableType,
  isListType,
  isObjectType,
  isScalarType,
  parse,
} from 'graphql';

const subgraph = process.argv[2];
const gateway = process.env.ERXES_GATEWAY_URL ?? 'http://localhost:4000';
const token = process.env.ERXES_AUTH_TOKEN;
const sdlPath =
  subgraph === 'core'
    ? 'backend/core-api/generated/schema.graphql'
    : `backend/plugins/${subgraph}_api/generated/schema.graphql`;

if (!subgraph || !token || !existsSync(sdlPath)) {
  console.error(
    'usage: ERXES_AUTH_TOKEN=<token> node scripts/graphql-drift-probe.mjs <subgraph>\n' +
      `needs ${sdlPath || '<sdl>'} from \`nx run gateway:schema:compose\``,
  );
  process.exit(2);
}

const run = async (query, variables = {}) => {
  const response = await fetch(`${gateway}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `auth-token=${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20_000),
  });
  return response.json();
};

const owned = new Set(
  parse(readFileSync(sdlPath, 'utf8'))
    .definitions.filter((d) => d.name?.value === 'Query')
    .flatMap((d) => d.fields.map((f) => f.name.value)),
);
const schema = buildClientSchema((await run(getIntrospectionQuery())).data);

// Paging and sorting change order or size, not membership.
const PAGING =
  /^(limit|cursor|direction|orderBy|sortField|sortDirection|page|perPage|cursorMode|sortMode|aggregationPipeline)$/;
const DATE = /date|from|start|end|since|until|to$/i;

// A value that should match nothing, or undefined when no such value is unambiguous.
const noMatch = (arg) => {
  const type = getNamedType(arg.type).name;
  const value = DATE.test(arg.name)
    ? /end|to$|until/i.test(arg.name)
      ? '1971-01-01'
      : '2099-01-01'
    : ['String', 'ID'].includes(type)
    ? 'graphql_drift_probe_no_match'
    : undefined;
  return value === undefined || !isListType(getNullableType(arg.type))
    ? value
    : [value];
};

// What to select and how to compare results: a total when there is one, else size plus first ids.
const fingerprint = (field) => {
  const type = getNamedType(field.type);
  if (isScalarType(type))
    return { select: '', of: (data) => JSON.stringify(data) };
  if (!isObjectType(type)) return null;
  const fields = type.getFields();
  if (fields.totalCount)
    return { select: '{ totalCount }', of: (data) => String(data?.totalCount) };
  if (!isListType(getNullableType(field.type))) return null;
  const id = fields._id ? '_id' : '__typename';
  return {
    select: `{ ${id} }`,
    of: (data) =>
      Array.isArray(data)
        ? `${data.length}:${data
            .slice(0, 5)
            .map((r) => r?._id)
            .join(',')}`
        : 'null',
  };
};

const isEmpty = (print) =>
  ['0', 'null', '[]', 'undefined', '0:'].includes(print);
const ignored = [];
const pairs = [];

for (const field of Object.values(schema.getQueryType().getFields())) {
  if (
    !owned.has(field.name) ||
    field.args.some((a) => a.type.toString().endsWith('!'))
  )
    continue;
  const print = fingerprint(field);
  // An exclude filter with a value that matches nothing excludes nothing, so it can't be probed this way.
  const args = field.args.filter(
    (a) =>
      !PAGING.test(a.name) &&
      !/^exclude/i.test(a.name) &&
      noMatch(a) !== undefined,
  );
  if (!print || !args.length) continue;

  const document = (arg) =>
    `query DriftProbe${arg ? `($${arg.name}: ${arg.type})` : ''} { result: ${
      field.name
    }${arg ? `(${arg.name}: $${arg.name})` : ''} ${print.select} }`;
  const baseline = await run(document());
  if (baseline.errors?.length) continue;
  const base = print.of(baseline.data?.result);
  if (isEmpty(base)) continue;

  for (const arg of args) {
    const result = await run(document(arg), { [arg.name]: noMatch(arg) });
    if (result.errors?.length || print.of(result.data?.result) !== base)
      continue;
    (DATE.test(arg.name) ? pairs : ignored).push(
      `${field.name}(${arg.name}: ${arg.type})`,
    );
  }
}

for (const line of ignored) console.log(`ignored  ${line}`);
for (const line of pairs)
  console.log(`check    ${line}  (a date bound may only apply with its pair)`);
console.log(
  `\n${ignored.length} ignored, ${pairs.length} to check in ${subgraph}`,
);
process.exit(ignored.length ? 1 : 0);

// Checks contracts against the composed gateway schema
// (`pnpm nx run gateway:schema:compose` writes it). For every entry:
// - its generated document validates: the field exists, the declared argument
//   types fit, required arguments are passed, the selection exists;
// - its input fields are exactly its args, and a required argument is a
//   required input field;
// - its leaves have the schema's scalar types and its lists and objects are
//   z.array and z.object.
// Output fields the schema calls nullable but the contract doesn't are
// warnings: erxes' SDL marks many always-set fields nullable, and a null that
// does arrive fails the runtime's output parse loudly. Keep a field non-null
// only when the plugin's Mongoose model requires it.
//
//   tsx scripts/check-contracts.ts                  every served contract
//   tsx scripts/check-contracts.ts src/contracts/x.ts   the contracts one file exports
import {
  buildSchema,
  type GraphQLOutputType,
  isEnumType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  parse,
  validate,
} from 'graphql';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as z from 'zod';
import { type Contract, contracts, toDocument } from '../src/contracts';

const schemaPath = resolve(
  __dirname,
  '../../../backend/gateway/generated/schema.graphql',
);
const schema = buildSchema(readFileSync(schemaPath, 'utf-8'));

const isContract = (value: unknown): value is Contract =>
  typeof value === 'object' &&
  value !== null &&
  'host' in value &&
  'entries' in value;

const unwrap = (s: z.ZodType): { inner: z.ZodType; nullable: boolean } => {
  if (s instanceof z.ZodNullable || s instanceof z.ZodOptional) {
    return { inner: unwrap(s.unwrap() as z.ZodType).inner, nullable: true };
  }

  if (s instanceof z.ZodDefault) {
    return unwrap(s.unwrap() as z.ZodType);
  }

  return { inner: s, nullable: false };
};

const LEAVES: Record<string, (s: z.ZodType) => boolean> = {
  String: (s) => s instanceof z.ZodString || s instanceof z.ZodEnum,
  ID: (s) => s instanceof z.ZodString,
  Int: (s) => s instanceof z.ZodNumber,
  Float: (s) => s instanceof z.ZodNumber,
  Boolean: (s) => s instanceof z.ZodBoolean,
};

// The output schema against the field's GraphQL type, recursively.
type Problems = { errors: string[]; warnings: string[] };

const checkOutput = (
  s: z.ZodType,
  type: GraphQLOutputType,
  path: string,
  problems: Problems,
) => {
  const { errors, warnings } = problems;
  const { inner, nullable } = unwrap(s);

  if (!isNonNullType(type) && !nullable) {
    warnings.push(`${path}: nullable in the schema, required here`);
  }

  const gql = isNonNullType(type) ? type.ofType : type;

  if (isListType(gql)) {
    if (!(inner instanceof z.ZodArray)) {
      errors.push(`${path}: the schema returns a list; use z.array`);
      return;
    }
    checkOutput(inner.element as z.ZodType, gql.ofType, `${path}[]`, problems);
    return;
  }

  if (isObjectType(gql)) {
    if (!(inner instanceof z.ZodObject)) {
      errors.push(`${path}: ${gql.name} is an object; use z.object`);
      return;
    }
    const fields = gql.getFields();
    for (const [key, child] of Object.entries(inner.shape)) {
      const field = fields[key];
      if (field) {
        checkOutput(child as z.ZodType, field.type, `${path}.${key}`, problems);
      }
    }
    return;
  }

  if (isEnumType(gql) && !LEAVES.String(inner)) {
    errors.push(`${path}: ${gql.name} is an enum; use z.string or z.enum`);
  }

  if (isScalarType(gql) && LEAVES[gql.name] && !LEAVES[gql.name](inner)) {
    errors.push(`${path}: the schema's type is ${gql.name}`);
  }
};

const checkEntry = (
  contract: Contract,
  entry: Contract['entries'][number],
): Problems => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const at = `${contract.host}@${contract.version} ${entry.name}`;
  const document = toDocument(contract.host, entry);
  const root =
    entry.kind === 'read' ? schema.getQueryType() : schema.getMutationType();
  const field = root?.getFields()[entry.field];

  if (!field) {
    errors.push(
      `${entry.field} is not a ${root?.name} field (${entry.kind} entries run on ${root?.name})`,
    );
    return { errors: errors.map((e) => `${at}: ${e}`), warnings };
  }

  for (const error of validate(schema, parse(document))) {
    errors.push(error.message);
  }

  if (!(entry.input instanceof z.ZodObject)) {
    errors.push('input must be a z.object');
  } else {
    const shape: Record<string, z.ZodType> = entry.input.shape;
    const inputKeys = Object.keys(shape).sort();
    const argKeys = Object.keys(entry.args).sort();

    if (inputKeys.join() !== argKeys.join()) {
      errors.push(
        `input fields [${inputKeys}] must be exactly the args [${argKeys}]`,
      );
    }

    for (const [arg, type] of Object.entries(entry.args)) {
      if (type.endsWith('!') && shape[arg] && unwrap(shape[arg]).nullable) {
        errors.push(`${arg} is ${type}, so the input field must be required`);
      }
    }
  }

  checkOutput(entry.output, field.type, entry.field, { errors, warnings });

  const label = (e: string) => `${at}: ${e}`;
  return { errors: errors.map(label), warnings: warnings.map(label) };
};

const loadContracts = async (files: string[]) => {
  if (files.length === 0) {
    return Object.values(contracts).flatMap(
      (versions) => Object.values(versions) as Contract[],
    );
  }

  const modules = await Promise.all(
    files.map((file) => import(resolve(process.cwd(), file))),
  );
  return modules.flatMap((mod) => Object.values(mod).filter(isContract));
};

const main = async () => {
  const checked = await loadContracts(process.argv.slice(2));
  const results = checked.flatMap((contract) =>
    contract.entries.map((entry) => checkEntry(contract, entry)),
  );
  const errors = results.flatMap((r) => r.errors);
  const warnings = results.flatMap((r) => r.warnings);

  if (warnings.length) {
    console.warn(warnings.map((w) => `warning ${w}`).join('\n'));
  }
  const entryCount = checked.reduce((n, c) => n + c.entries.length, 0);

  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} problems in ${entryCount} entries`);
    process.exit(1);
  }

  console.log(`${entryCount} entries in ${checked.length} contracts check out`);
};

void main();

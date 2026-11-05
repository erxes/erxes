// Node side: what the CLI and the runtime share.
export { ExtensionError } from './errors';
export type { ErrorBody, ErrorIssue } from './errors';
export { pluginName } from './names';
export { checkExtensionSchema, extensionTypeDefs } from './schema';
export type { ExtensionGraphql, SchemaInput } from './schema';

export type Indexes = Record<
  string,
  { keys: Record<string, 1 | -1>; unique?: boolean; sparse?: boolean }[]
>;

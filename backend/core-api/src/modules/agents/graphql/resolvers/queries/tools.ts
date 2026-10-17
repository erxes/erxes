import {
  listAgentToolManifests,
  type IAgentToolDescriptor,
} from '@/agents/agentTools';
import { requiresApproval } from '@/agents/tools';
import type { IContext } from '~/connectionResolvers';

/** Zod class name → display type. Wrappers erase to their inner type only
 * when the manifest's JSON schema knows it; otherwise they mean 'any'. */
const ZOD_TYPE_LABELS: Record<string, string> = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
  ZodArray: 'array',
  ZodObject: 'object',
  ZodEnum: 'enum',
  ZodNativeEnum: 'enum',
  ZodDate: 'date',
  ZodUnion: 'union',
};

const ZOD_WRAPPERS = new Set([
  'ZodOptional',
  'ZodNullable',
  'ZodDefault',
  'ZodEffects',
  'ZodLazy',
]);

/** Maps a manifest `inputFields[].type` Zod name to a display type. */
const mapZodTypeName = (raw: string | undefined): string => {
  if (!raw) {
    return 'any';
  }

  return ZOD_TYPE_LABELS[raw] ?? (ZOD_WRAPPERS.has(raw) ? 'any' : 'any');
};

interface IJsonSchemaField {
  type?: string | string[];
  enum?: unknown[];
  anyOf?: IJsonSchemaField[];
  oneOf?: IJsonSchemaField[];
  items?: IJsonSchemaField;
}

const jsonSchemaType = (field: IJsonSchemaField | undefined): string => {
  if (!field) {
    return 'any';
  }

  if (field.enum) {
    return 'enum';
  }

  const combined = field.anyOf ?? field.oneOf;

  if (combined) {
    const types = combined
      .map((member) => member.type)
      .flat()
      .filter((t): t is string => !!t && t !== 'null');

    return types.length > 0 ? [...new Set(types)].join(' | ') : 'any';
  }

  if (Array.isArray(field.type)) {
    return field.type.filter((t) => t !== 'null').join(' | ') || 'any';
  }

  if (field.type === 'array') {
    return 'array';
  }

  return field.type ?? 'any';
};

/**
 * Display-ready input fields. When the descriptor carries a JSON schema we
 * derive types + required flags from it; otherwise the manifest's Zod class
 * names (`ZodString`, `ZodOptional`) are mapped — never emitted raw.
 */
const describeInputFields = (
  descriptor: IAgentToolDescriptor,
): { name: string; type: string; required: boolean }[] | null => {
  if (!descriptor.inputFields) {
    return null;
  }

  const schema = descriptor.inputSchema as
    | { properties?: Record<string, IJsonSchemaField>; required?: string[] }
    | undefined;
  // A bare `{ type: 'object' }` schema carries no field detail — only the
  // JSON-schema path when `properties` exists, else the Zod-name fallback.
  const hasProperties =
    !!schema?.properties && typeof schema.properties === 'object';
  const properties: Record<string, IJsonSchemaField> = hasProperties
    ? schema?.properties ?? {}
    : {};
  const requiredSet = new Set(schema?.required ?? []);

  return descriptor.inputFields.map((field) => ({
    name: field.name,
    type: hasProperties
      ? jsonSchemaType(properties[field.name])
      : mapZodTypeName(field.type),
    required: hasProperties ? requiredSet.has(field.name) : field.required,
  }));
};

/**
 * The capabilities catalog: every agent-admitted tool across all plugins,
 * each annotated with whether it asks for approval and whether the acting
 * user holds its declared permission. `unavailablePlugins` lists plugin
 * names only — addresses and error text stay server-side.
 *
 * Permission checks run through `ctx.checkPermission` in a per-request
 * cache keyed on the declared action, so a catalog of many tools costs at
 * most one check per unique action.
 */
export const agentsToolsQueries = {
  agentsTools: async (_parent: undefined, _args: unknown, ctx: IContext) => {
    await ctx.checkPermission('showAgents');

    const [{ manifests, failures }, settings] = await Promise.all([
      listAgentToolManifests(ctx.subdomain),
      ctx.models.AgentsSettings.getSettings(),
    ]);
    const approvalMode =
      settings.approvalMode === 'destructive' ? 'destructive' : 'writes';

    const allowedByAction = new Map<string, boolean>();
    const actionAllowed = async (action: string): Promise<boolean> => {
      const cached = allowedByAction.get(action);

      if (cached !== undefined) {
        return cached;
      }

      let allowed = false;

      try {
        await ctx.checkPermission(action);
        allowed = true;
      } catch {
        allowed = false;
      }

      allowedByAction.set(action, allowed);
      return allowed;
    };

    const tools = manifests
      .flatMap((manifest) => manifest.tools)
      .map((descriptor) => ({
        id: descriptor.id,
        plugin: descriptor.plugin,
        module: descriptor.module,
        path: descriptor.path,
        method: descriptor.method,
        description: descriptor.description,
        requiresApproval: requiresApproval(descriptor, approvalMode),
        permission: descriptor.permission,
        inputFields: describeInputFields(descriptor),
        // no inputSchema — internals stay server-side
      }))
      .sort(
        (a, b) =>
          a.plugin.localeCompare(b.plugin) || a.path.localeCompare(b.path),
      );

    const resolved = await Promise.all(
      tools.map(async (tool) => ({
        ...tool,
        allowed: tool.permission
          ? await actionAllowed(tool.permission.action)
          : false,
      })),
    );

    return {
      tools: resolved,
      unavailablePlugins: failures.map((failure) => failure.plugin),
    };
  },
};

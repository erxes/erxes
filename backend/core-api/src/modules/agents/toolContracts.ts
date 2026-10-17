import { z } from 'zod/v4';

/**
 * Agent-facing contracts, reviewed against source on 2026-09-07.
 * No source imports: owning services remain responsible for business rules.
 * Review references (repository-relative, documentation only):
 * - backend/core-api/src/init-trpc.ts (published procedure paths)
 * - backend/core-api/src/modules/products/trpc/{product,category,uom}.ts
 * - backend/core-api/src/modules/products/db/models/{Products,Categories,Uoms}.ts
 * - backend/core-api/src/modules/products/db/definitions/products.ts
 * - backend/erxes-api-shared/src/core-types/{common,modules/products/product}.ts
 *
 * Strict agent subsets deliberately reject unsupported fields rather than
 * silently discard them. Extend from verified source, not guessed CSV aliases.
 */
const text = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: 'Must not be blank',
});
const strings = z.array(text);
const query = z.record(z.string(), z.json());
const attachment = z.strictObject({
  name: text, url: text, size: z.number().nonnegative(), type: text,
});
const durationType = z.enum([
  'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year',
]);
const productFields = {
  name: text,
  code: text.describe('Unique product code; core removes *, underscores and spaces.'),
  categoryId: text.optional().describe('Existing category ID, or supply categoryCode.'),
  categoryCode: text.optional().describe('Existing category code; core resolves it to categoryId.'),
  uom: text.describe('Existing UOM code/name/ID. Core may create a UOM for an unknown value; resolve with productUoms.find first.'),
  type: z.enum(['product', 'service', 'unique', 'subscription']).optional(),
  duration: z.number().positive().optional().describe('Required with durationType for unique products; cleared for other types.'),
  durationType: durationType.optional(),
  unitPrice: z.number().optional(),
  description: z.string().optional(),
  shortName: z.string().optional(),
  status: z.enum(['active', 'deleted']).optional(),
  barcodes: strings.optional(),
  barcodeDescription: z.string().optional(),
  variants: z.record(z.string(), z.strictObject({
    name: z.string().optional(), image: attachment.optional(),
  })).optional(),
  tagIds: strings.optional(),
  scopeBrandIds: strings.optional(),
  currency: text.optional(),
  vendorId: text.optional(),
  vendorCode: text.optional(),
  subUoms: z.array(z.strictObject({ uom: text, ratio: z.number() })).optional(),
  attachment: attachment.optional(),
  attachmentMore: z.array(attachment).optional(),
  videos: z.array(attachment).optional(),
  customFieldsData: z.array(z.strictObject({
    field: text,
    value: z.json(),
    stringValue: z.string().optional(),
    numberValue: z.number().optional(),
    dateValue: z.string().optional(),
    extraValue: z.string().optional(),
  })).optional(),
  propertiesData: z.record(z.string(), z.union([
    z.string(), z.number(), z.boolean(), z.null(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
  ])).optional(),
};

const createDoc = z.strictObject(productFields).superRefine((doc, ctx) => {
  if (!doc.categoryId && !doc.categoryCode) {
    ctx.addIssue({ code: 'custom', path: ['categoryId'], message: 'Supply categoryId or categoryCode from an existing category.' });
  }
  if (!doc.code.replace(/[*_ ]/g, '').trim()) {
    ctx.addIssue({ code: 'custom', path: ['code'], message: 'Code must remain nonblank after core normalization.' });
  }
  if (doc.type === 'unique') {
    if (doc.duration === undefined) {
      ctx.addIssue({ code: 'custom', path: ['duration'], message: 'Required for unique products.' });
    }
    if (doc.durationType === undefined) {
      ctx.addIssue({ code: 'custom', path: ['durationType'], message: 'Required for unique products.' });
    }
  }
});

const findOne = z.strictObject({
  query: query.describe('Nonempty selector, preferably {_id} or {code}.'),
}).refine(({ query: selector }) => Object.keys(selector).length > 0, {
  path: ['query'], message: 'Supply a nonempty selector.',
});

interface IAgentToolContract {
  schema: z.ZodTypeAny;
  inputSchema: Record<string, unknown>;
  description: string;
}

const contract = (
  schema: z.ZodTypeAny,
  description: string,
): IAgentToolContract => {
  const inputSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  delete inputSchema.$schema;
  return { schema, inputSchema, description };
};

const contracts: Record<string, IAgentToolContract> = {
  'core.trpc.products.createProduct': contract(
    z.strictObject({ doc: createDoc }),
    'Create one product with {doc:{name,code,uom,categoryId or categoryCode,...}}. Use code, not sku, and unitPrice, not price. Resolve category and UOM first; check products.findOne for duplicate code. Core normalizes code/barcodes, checks uniqueness/category masks, resolves or creates UOMs and writes product/events/knowledge. Unique products require positive duration and durationType. Other types discard duration. Category existence, masks and uniqueness are checked by core, not this local contract. After an ambiguous failure, check by code before retrying creation.',
  ),
  'core.trpc.products.updateProduct': contract(
    z.strictObject({
      _id: text,
      doc: z.strictObject(productFields).partial().refine(
        (doc) => Object.keys(doc).length > 0,
        { message: 'Supply at least one field to update.' },
      ),
    }),
    'Update one product with {_id,doc:{fields to change}}. Read products.findOne first. Omitted fields retain stored values; current type/duration determine unique-product validation. Core clears duration when changing away from unique. For similarity-linked products core ignores code/propertiesData changes. Core enforces category masks and uniqueness; do not assume every field can change on every product.',
  ),
  'core.trpc.products.findOne': contract(
    findOne,
    'Find one product with {query:{_id or code}}. Core returns the product, or {} when nothing matches. Use to check duplicates and current values before create/update. This agent contract requires a nonempty query wrapper; core also accepts selector or a bare filter.',
  ),
  'core.trpc.products.count': contract(
    z.strictObject({ query: query.optional(), categoryId: text.optional() }),
    'Count products with {query?,categoryId?}. categoryId includes descendant categories and replaces query.categoryId. Returns a number. Use counts rather than downloading collections.',
  ),
  'core.trpc.products.rules.find': contract(
    z.strictObject({ _ids: strings }),
    'Find PRODUCT RULES by {_ids:[ruleId,...]}; empty IDs return []. This is not a product search and does not implement query, pagination or category filters.',
  ),
  'core.trpc.productCategories.find': contract(
    z.strictObject({
      query: query.optional(),
      sort: z.record(z.string(), z.union([z.literal(1), z.literal(-1)])).optional(),
      regData: text.optional(),
    }),
    'Find product categories with {query?,sort?,regData?}; returns category records. regData matches an order prefix. Resolve an existing category by code/name and use its _id or code for product creation. There is no pagination here: narrow the filter if the result is too large.',
  ),
  'core.trpc.productCategories.findOne': contract(
    findOne,
    'Find one product category with {query:{_id or code}}. Core returns the category, or {} when nothing matches.',
  ),
  'core.trpc.productCategories.count': contract(
    z.strictObject({ query: query.optional() }),
    'Count product categories matching {query?}; returns a number.',
  ),
  'core.trpc.productUoms.find': contract(
    z.strictObject({ query: query.optional() }),
    'Find units of measure with {query?}; returns UOM records. Resolve a known code/name/ID before creating a product, because product creation may insert unknown UOM values. No pagination is implemented; narrow the query.',
  ),
  'core.trpc.productUoms.findOne': contract(
    findOne,
    'Find one unit of measure with {query:{_id or code}}. Core returns the UOM, or {} when nothing matches.',
  ),
};

export const getAgentToolContract = (
  toolId: string,
): IAgentToolContract | undefined => contracts[toolId];

/** One validation path for normal calls and the code-mode bridge. */
export const validateAgentToolInput = (
  toolId: string,
  input: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  const reviewed = getAgentToolContract(toolId);
  if (!reviewed) return input;
  const parsed = reviewed.schema.safeParse(input ?? {});
  if (!parsed.success) {
    // Do not echo input values. Full constraints remain available in discovery.
    const details = parsed.error.issues.slice(0, 8).map((issue) =>
      `${issue.path.join('.') || 'input'}: ${issue.message}`,
    ).join('; ');
    throw Object.assign(new Error(`Invalid tool input: ${details}`), {
      code: 'INVALID_TOOL_INPUT',
      statusCode: 400,
      suggestion: 'Use searchTools to read this tool\'s inputSchema and correct the input before retrying. Unknown fields are rejected; no aliases are guessed.',
    });
  }
  return parsed.data as Record<string, unknown>;
};

export const applyAgentToolContract = <
  T extends { id: string; description: string },
>(
  tool: T,
): T & { inputSchema?: Record<string, unknown> } => {
  const reviewed = getAgentToolContract(tool.id);
  if (!reviewed) return tool;
  return {
    ...tool,
    description: reviewed.description,
    inputSchema: reviewed.inputSchema,
  };
};

import { z } from 'zod';

export const dynamicBindingSchema = z.object({
  key: z.string().min(1),
  source: z.enum([
    'tour',
    'itinerary',
    'pricing',
    'included',
    'excluded',
    'hotels',
    'transport',
    'contact',
    'custom',
  ]),
  path: z.string().min(1),
  fallback: z.string().optional(),
  formatter: z
    .enum(['currency', 'date', 'uppercase', 'lowercase', 'join'])
    .optional(),
  formatOptions: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const sizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

const frameSchema = pointSchema.extend({
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
});

const marginsSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
});

const typographySchema = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  fontWeight: z.union([
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
  ]),
  fontStyle: z.enum(['normal', 'italic']),
  lineHeight: z.number().positive(),
  letterSpacing: z.number(),
  color: z.string().min(1),
  textAlign: z.enum(['left', 'center', 'right', 'justify']),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  textTransform: z
    .enum(['none', 'uppercase', 'lowercase', 'capitalize'])
    .optional(),
});

const strokeSchema = z.object({
  color: z.string(),
  width: z.number().min(0),
  dash: z.array(z.number()).optional(),
});

const boxStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  borderRadius: z.number().min(0).optional(),
  border: strokeSchema.optional(),
  padding: marginsSchema.partial().optional(),
  shadow: z
    .object({
      color: z.string(),
      blur: z.number(),
      offsetX: z.number(),
      offsetY: z.number(),
      opacity: z.number().min(0).max(1),
    })
    .optional(),
});

export const assetReferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.literal('image'),
  url: z.string().url(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  mimeType: z.string().min(1),
  fileSize: z.number().nonnegative(),
  thumbnailUrl: z.string().url().optional(),
});

export const pageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number().min(0),
  size: sizeSchema,
  orientation: z.enum(['portrait', 'landscape']),
  margins: marginsSchema,
  background: z.object({
    fill: z.string().min(1),
    imageAssetId: z.string().optional(),
  }),
  grid: z.object({
    enabled: z.boolean(),
    size: z.number().positive(),
    snap: z.boolean(),
  }),
});

const elementBaseSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'text',
    'image',
    'shape',
    'dynamic-text',
    'dynamic-stack',
    'table',
  ]),
  name: z.string().min(1),
  pageId: z.string().min(1),
  frame: frameSchema,
  locked: z.boolean(),
  visible: z.boolean(),
  zIndex: z.number().int(),
  box: boxStyleSchema,
  opacity: z.number().min(0).max(1),
});

export const textElementSchema = elementBaseSchema.extend({
  type: z.literal('text'),
  props: z.object({
    content: z.string(),
    typography: typographySchema,
  }),
});

export const dynamicTextElementSchema = elementBaseSchema.extend({
  type: z.literal('dynamic-text'),
  props: z.object({
    label: z.string().min(1),
    placeholder: z.string().min(1),
    binding: dynamicBindingSchema,
    typography: typographySchema,
  }),
});

export const imageElementSchema = elementBaseSchema.extend({
  type: z.literal('image'),
  props: z.object({
    assetId: z.string().optional(),
    binding: dynamicBindingSchema.optional(),
    fit: z.enum(['cover', 'contain', 'fill']),
    alt: z.string().optional(),
  }),
});

export const shapeElementSchema = elementBaseSchema.extend({
  type: z.literal('shape'),
  props: z.object({
    shape: z.enum(['rectangle', 'circle', 'line']),
    fill: z.string(),
    stroke: strokeSchema.optional(),
  }),
});

export const dynamicStackElementSchema = elementBaseSchema.extend({
  type: z.literal('dynamic-stack'),
  props: z.object({
    itemBinding: dynamicBindingSchema,
    gap: z.number().min(0),
    direction: z.enum(['vertical', 'horizontal']),
    childElementIds: z.array(z.string()),
    maxItems: z.number().int().positive().optional(),
  }),
});

export const tableElementSchema = elementBaseSchema.extend({
  type: z.literal('table'),
  props: z.object({
    columns: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        width: z.number().positive(),
        binding: dynamicBindingSchema.optional(),
      }),
    ),
    rowBinding: dynamicBindingSchema,
    rowHeight: z.number().positive(),
    headerTypography: typographySchema,
    cellTypography: typographySchema,
  }),
});

export const templateElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  dynamicTextElementSchema,
  imageElementSchema,
  shapeElementSchema,
  dynamicStackElementSchema,
  tableElementSchema,
]);

export const reusableBlockSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  rootElementIds: z.array(z.string()),
  category: z.enum([
    'hero',
    'day-section',
    'pricing',
    'services',
    'hotel',
    'transport',
    'legal',
    'contact',
  ]),
});

export const pdfTemplateDocumentSchema = z.object({
  id: z.string().min(1),
  branchId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  version: z.number().int().positive(),
  versionStatus: z.enum(['active', 'snapshot']),
  unit: z.literal('px'),
  locale: z.string().min(2),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    surfaceColor: z.string(),
    textColor: z.string(),
    headingFontFamily: z.string(),
    bodyFontFamily: z.string(),
  }),
  pages: z.array(pageSchema).min(1),
  elements: z.array(templateElementSchema),
  reusableBlocks: z.array(reusableBlockSchema),
  assets: z.array(assetReferenceSchema),
  bindings: z.array(dynamicBindingSchema),
  metadata: z.object({
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1),
    tags: z.array(z.string()),
    thumbnailUrl: z.string().url().optional(),
  }),
});

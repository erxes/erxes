import * as z from 'zod';
import { defineContract } from '../define';

// core@1 calls for products, product categories, uoms, brands, segments,
// documents, email templates, and read-only custom fields (properties) and
// field groups. Forms are left out: core's forms module has no form records,
// frontline owns them.

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const page = <T extends z.ZodType>(item: T) =>
  z.object({
    list: z.array(item).nullable(),
    totalCount: z.number().nullable(),
    pageInfo: PageInfo.nullable(),
  });

const Product = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  code: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  categoryId: z.string().nullable(),
  unitPrice: z.number().nullable(),
  uom: z.string().nullable(),
  barcodes: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  tagIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
});

const ProductType = z.enum(['product', 'service', 'unique', 'subscription']);

const ProductCategory = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string(),
  order: z.string(),
  parentId: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  scopeBrandIds: z.array(z.string()).nullable(),
});

const CategoryStatus = z.enum(['active', 'disabled', 'archived']);

const Uom = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  isForSubscription: z.boolean().nullable(),
  timely: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const Brand = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const SegmentSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  contentType: z.string(),
  color: z.string().nullable(),
  status: z.string(),
  visibility: z.string(),
  membersCount: z.number().nullable(),
  // The condition tree. Shape follows SegmentNode in erxes-api-shared.
  root: z.unknown(),
  createdAt: z.string(),
});

const DocumentSummary = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  contentType: z.string(),
  subType: z.string().nullable(),
  tagIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
});

const DocumentDetail = DocumentSummary.extend({
  content: z.string().nullable(),
});

const EmailTemplateSummary = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  contentFormat: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const EmailTemplateDetail = EmailTemplateSummary.extend({
  content: z.string().nullable(),
  contentJson: z.unknown().nullable(),
});

const Property = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  type: z.string().nullable(),
  groupId: z.string().nullable(),
  order: z.number().nullable(),
  isRequired: z.boolean().nullable(),
  isVisible: z.boolean().nullable(),
  options: z
    .array(
      z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        deprecated: z.boolean().nullable(),
      }),
    )
    .nullable(),
});

const PropertyGroup = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  contentType: z.string().nullable(),
  order: z.number().nullable(),
});

const Id = z.string().min(1);
const PageSize = z.number().int().min(1).max(50);

export const coreProductsContract = defineContract('core', 1, [
  {
    name: 'products.list',
    description:
      'Read-only. Lists products sorted by code, 20 per page by default. page starts at 1 and perPage is capped at 50. Deleted products are excluded. unitPrice is the list price in the product currency.',
    kind: 'read',
    field: 'products',
    args: {
      searchValue: 'String',
      categoryIds: '[String]',
      page: 'Int',
      perPage: 'Int',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryIds: z.array(Id).optional(),
        page: z.number().int().min(1).optional(),
        perPage: PageSize.optional(),
      })
      .strict(),
    output: z.array(Product),
  },
  {
    name: 'products.count',
    description:
      'Read-only. Counts the products that products.list returns for the same searchValue and categoryIds, ignoring paging. Deleted products are excluded.',
    kind: 'read',
    field: 'productsTotalCount',
    args: { searchValue: 'String', categoryIds: '[String]' },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryIds: z.array(Id).optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'products.get',
    description:
      'Read-only. Reads one product by _id. Returns null when no product has that _id.',
    kind: 'read',
    field: 'productDetail',
    args: { _id: 'String' },
    input: z.object({ _id: Id }).strict(),
    output: Product.nullable(),
  },
  {
    name: 'products.create',
    description:
      'Creates a product and returns it. name, code and categoryId are required. code is stored without spaces, underscores or asterisks, and must be unique. type defaults to product. Needs the productsCreate permission.',
    kind: 'write',
    field: 'productsAdd',
    args: {
      name: 'String',
      code: 'String',
      categoryId: 'String',
      type: 'String',
      shortName: 'String',
      description: 'String',
      unitPrice: 'Float',
      uom: 'String',
      barcodes: '[String]',
    },
    input: z
      .object({
        name: Id,
        code: Id,
        categoryId: Id,
        type: ProductType.optional(),
        shortName: z.string().optional(),
        description: z.string().optional(),
        unitPrice: z.number().optional(),
        uom: z.string().optional(),
        barcodes: z.array(z.string()).optional(),
      })
      .strict(),
    output: Product,
  },
  {
    name: 'products.edit',
    description:
      'Updates a product and returns it. Only the fields you pass change. Any edit sets status to active, so editing a deleted product restores it. Needs the productsUpdate permission.',
    kind: 'write',
    field: 'productsEdit',
    args: {
      _id: 'String!',
      name: 'String',
      code: 'String',
      categoryId: 'String',
      type: 'String',
      shortName: 'String',
      description: 'String',
      unitPrice: 'Float',
      uom: 'String',
      barcodes: '[String]',
    },
    input: z
      .object({
        _id: Id,
        name: Id.optional(),
        code: Id.optional(),
        categoryId: Id.optional(),
        type: ProductType.optional(),
        shortName: z.string().optional(),
        description: z.string().optional(),
        unitPrice: z.number().optional(),
        uom: z.string().optional(),
        barcodes: z.array(z.string()).optional(),
      })
      .strict(),
    output: Product.nullable(),
  },
  {
    name: 'products.remove',
    description:
      'Removes products by _id. Products are soft-deleted: status becomes deleted and they leave products.list. Returns the resolver status string. Needs the productsDelete permission.',
    kind: 'destructive',
    field: 'productsRemove',
    args: { productIds: '[String!]' },
    input: z.object({ productIds: z.array(Id).min(1) }).strict(),
    output: z.string(),
  },
  {
    name: 'productCategories.list',
    description:
      'Read-only. Lists product categories sorted by order. Disabled and archived categories are hidden unless status asks for them. parentId returns only the direct children of that category.',
    kind: 'read',
    field: 'productCategories',
    args: { searchValue: 'String', parentId: 'String', status: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        parentId: z.string().optional(),
        status: CategoryStatus.optional(),
      })
      .strict(),
    output: z.array(ProductCategory),
  },
  {
    name: 'productCategories.count',
    description:
      'Read-only. Counts the categories that productCategories.list returns for the same filters.',
    kind: 'read',
    field: 'productCategoriesTotalCount',
    args: { searchValue: 'String', parentId: 'String', status: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        parentId: z.string().optional(),
        status: CategoryStatus.optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'productCategories.get',
    description:
      'Read-only. Reads one product category by _id. Returns null when no category has that _id.',
    kind: 'read',
    field: 'productCategoryDetail',
    args: { _id: 'String' },
    input: z.object({ _id: Id }).strict(),
    output: ProductCategory.nullable(),
  },
  {
    name: 'productCategories.create',
    description:
      'Creates a product category and returns it. name and code are required, and code must be unique. Omit parentId for a root category. order is generated. Needs the productCategoriesManage permission.',
    kind: 'write',
    field: 'productCategoriesAdd',
    args: {
      name: 'String!',
      code: 'String!',
      description: 'String',
      parentId: 'String',
      status: 'String',
    },
    input: z
      .object({
        name: Id,
        code: Id,
        description: z.string().optional(),
        parentId: z.string().optional(),
        status: CategoryStatus.optional(),
      })
      .strict(),
    output: ProductCategory,
  },
  {
    name: 'productCategories.edit',
    description:
      'Updates a product category and returns it. name and code are required. Needs the productCategoriesManage permission.',
    kind: 'write',
    field: 'productCategoriesEdit',
    args: {
      _id: 'String!',
      name: 'String!',
      code: 'String!',
      description: 'String',
      parentId: 'String',
      status: 'String',
    },
    input: z
      .object({
        _id: Id,
        name: Id,
        code: Id,
        description: z.string().optional(),
        parentId: z.string().optional(),
        status: CategoryStatus.optional(),
      })
      .strict(),
    output: ProductCategory.nullable(),
  },
  {
    name: 'productCategories.remove',
    description:
      'Removes a product category by _id. Refused while the category still has products that are not deleted, or has child categories. Needs the productCategoriesManage permission.',
    kind: 'destructive',
    field: 'productCategoriesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: Id }).strict(),
    output: z.unknown(),
  },
  {
    name: 'uoms.list',
    description: 'Read-only. Lists all units of measure.',
    kind: 'read',
    field: 'uoms',
    args: {},
    input: z.object({}).strict(),
    output: z.array(Uom),
  },
  {
    name: 'uoms.count',
    description: 'Read-only. Counts all units of measure.',
    kind: 'read',
    field: 'uomsTotalCount',
    args: {},
    input: z.object({}).strict(),
    output: z.number(),
  },
  {
    name: 'uoms.create',
    description:
      'Creates a unit of measure and returns it. name and code are required, and code must be unique. Needs the uomsManage permission.',
    kind: 'write',
    field: 'uomsAdd',
    args: { name: 'String', code: 'String' },
    input: z.object({ name: Id, code: Id }).strict(),
    output: Uom,
  },
  {
    name: 'uoms.edit',
    description:
      'Updates a unit of measure and returns it. name and code are both required. Needs the uomsManage permission.',
    kind: 'write',
    field: 'uomsEdit',
    args: { _id: 'String!', name: 'String', code: 'String' },
    input: z.object({ _id: Id, name: Id, code: Id }).strict(),
    output: Uom.nullable(),
  },
  {
    name: 'uoms.remove',
    description:
      "Removes units of measure by _id. Returns the resolver status string, 'deleted' or 'updated'. Needs the uomsManage permission.",
    kind: 'destructive',
    field: 'uomsRemove',
    args: { uomIds: '[String!]' },
    input: z.object({ uomIds: z.array(Id).min(1) }).strict(),
    output: z.string(),
  },
  {
    name: 'brands.list',
    description:
      'Read-only. Lists brands whose name matches searchValue, 20 per page by default. Pass pageInfo.endCursor as cursor to get the next page.',
    kind: 'read',
    field: 'brands',
    args: { searchValue: 'String', limit: 'Int', cursor: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        limit: PageSize.optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: page(Brand),
  },
  {
    name: 'brands.count',
    description: 'Read-only. Counts all brands.',
    kind: 'read',
    field: 'brandsTotalCount',
    args: {},
    input: z.object({}).strict(),
    output: z.number(),
  },
  {
    name: 'brands.get',
    description:
      'Read-only. Reads one brand by _id. Returns null when no brand has that _id.',
    kind: 'read',
    field: 'brandDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: Id }).strict(),
    output: Brand.nullable(),
  },
  {
    name: 'brands.create',
    description:
      'Creates a brand and returns it. name is required. code is generated. Needs the brandsCreate permission.',
    kind: 'write',
    field: 'brandsAdd',
    args: { name: 'String!', description: 'String' },
    input: z
      .object({
        name: Id,
        description: z.string().optional(),
      })
      .strict(),
    output: Brand,
  },
  {
    name: 'brands.edit',
    description:
      'Updates a brand name or description and returns it. name is required. Needs the brandsUpdate permission.',
    kind: 'write',
    field: 'brandsEdit',
    args: { _id: 'String!', name: 'String!', description: 'String' },
    input: z
      .object({
        _id: Id,
        name: Id,
        description: z.string().optional(),
      })
      .strict(),
    output: Brand.nullable(),
  },
  {
    name: 'brands.remove',
    description: 'Deletes brands by _id. Needs the brandsDelete permission.',
    kind: 'destructive',
    field: 'brandsRemove',
    args: { _ids: '[String!]' },
    input: z.object({ _ids: z.array(Id).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'segments.list',
    description:
      'Read-only. Lists the saved segments for the given contentTypes, sorted by name. Segments that a feature owns are excluded. membersCount is null until the segmentation worker has counted members.',
    kind: 'read',
    field: 'segments',
    args: { contentTypes: '[String]!', searchValue: 'String' },
    input: z
      .object({
        contentTypes: z.array(Id).min(1),
        searchValue: z.string().optional(),
      })
      .strict(),
    output: z.array(SegmentSummary),
  },
  {
    name: 'segments.get',
    description:
      'Read-only. Reads one segment by _id, including its condition tree in root. Returns null when no segment has that _id or the caller cannot see it.',
    kind: 'read',
    field: 'segmentDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: Id }).strict(),
    output: SegmentSummary.nullable(),
  },
  {
    name: 'documents.list',
    description:
      'Read-only. Lists documents the caller can view, 20 per page by default. content is left out, so read it with documents.get. Pass pageInfo.endCursor as cursor to get the next page. Needs the documentsRead permission.',
    kind: 'read',
    field: 'documents',
    args: {
      limit: 'Int',
      searchValue: 'String',
      contentType: 'String',
      subType: 'String',
      cursor: 'String',
    },
    input: z
      .object({
        limit: PageSize.optional(),
        searchValue: z.string().optional(),
        contentType: z.string().optional(),
        subType: z.string().optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: page(DocumentSummary),
  },
  {
    name: 'documents.count',
    description:
      'Read-only. Counts the documents that documents.list returns for the same searchValue and contentType. Needs the documentsRead permission.',
    kind: 'read',
    field: 'documentsTotalCount',
    args: { searchValue: 'String', contentType: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        contentType: z.string().optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'documents.get',
    description:
      'Read-only. Reads one document with its content. Returns null when no document has that _id. Fails for a document an approval lock hides from the caller. Needs the documentsRead permission.',
    kind: 'read',
    field: 'documentsDetail',
    args: { _id: 'String!' },
    notFound: 'Document not found',
    input: z.object({ _id: Id }).strict(),
    output: DocumentDetail.nullable(),
  },
  {
    name: 'documents.create',
    description:
      'Creates a document and returns it. name and contentType are required. Needs the manageDocuments permission.',
    kind: 'write',
    field: 'documentsSave',
    args: {
      name: 'String!',
      contentType: 'String',
      subType: 'String',
      code: 'String',
      content: 'String',
    },
    input: z
      .object({
        name: Id,
        contentType: Id,
        subType: z.string().optional(),
        code: z.string().optional(),
        content: z.string().optional(),
      })
      .strict(),
    output: DocumentDetail,
  },
  {
    name: 'documents.edit',
    description:
      'Updates a document and returns it. _id, name and contentType are required. Other fields change only when you pass them. Needs the manageDocuments permission and access to the document.',
    kind: 'write',
    field: 'documentsSave',
    args: {
      _id: 'String',
      name: 'String!',
      contentType: 'String',
      subType: 'String',
      code: 'String',
      content: 'String',
    },
    input: z
      .object({
        _id: Id,
        name: Id,
        contentType: Id,
        subType: z.string().optional(),
        code: z.string().optional(),
        content: z.string().optional(),
      })
      .strict(),
    output: DocumentDetail.nullable(),
  },
  {
    name: 'documents.remove',
    description:
      'Deletes a document by _id and returns the deleted record. Needs the removeDocuments permission and access to the document.',
    kind: 'destructive',
    field: 'documentsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: Id }).strict(),
    output: z.unknown(),
  },
  {
    name: 'emailTemplates.list',
    description:
      'Read-only. Lists email templates, newest first, matching name or description to searchValue. 20 per page by default. Pass pageInfo.endCursor as cursor to get the next page.',
    kind: 'read',
    field: 'emailTemplates',
    args: { searchValue: 'String', limit: 'Int', cursor: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        limit: PageSize.optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: page(EmailTemplateSummary),
  },
  {
    name: 'emailTemplates.get',
    description:
      'Read-only. Reads one email template with its content and contentJson. Returns null when no template has that _id.',
    kind: 'read',
    field: 'emailTemplateDetail',
    args: { _id: 'String!' },
    notFound: 'Email template not found',
    input: z.object({ _id: Id }).strict(),
    output: EmailTemplateDetail.nullable(),
  },
  {
    name: 'emailTemplates.create',
    description:
      'Creates an email template with block content and returns it. name is required. Needs the emailTemplatesCreate permission.',
    kind: 'write',
    field: 'emailTemplateAdd',
    args: { name: 'String!', description: 'String', content: 'String' },
    input: z
      .object({
        name: Id,
        description: z.string().optional(),
        content: z.string().optional(),
      })
      .strict(),
    output: EmailTemplateDetail,
  },
  {
    name: 'emailTemplates.edit',
    description:
      'Updates an email template name, description or block content and returns it. name is required. Needs the emailTemplatesUpdate permission.',
    kind: 'write',
    field: 'emailTemplateEdit',
    args: {
      _id: 'String!',
      name: 'String!',
      description: 'String',
      content: 'String',
    },
    input: z
      .object({
        _id: Id,
        name: Id,
        description: z.string().optional(),
        content: z.string().optional(),
      })
      .strict(),
    output: EmailTemplateDetail.nullable(),
  },
  {
    name: 'emailTemplates.remove',
    description:
      'Deletes an email template by _id. Needs the emailTemplatesDelete permission.',
    kind: 'destructive',
    field: 'emailTemplateRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: Id }).strict(),
    output: z.unknown(),
  },
  {
    name: 'properties.list',
    description:
      'Read-only. Lists custom fields (properties), optionally for one contentType or groupId. Archived fields are excluded. Options marked deprecated are still returned, with deprecated set to true. 20 per page by default. Pass pageInfo.endCursor as cursor to get the next page.',
    kind: 'read',
    field: 'fields',
    args: { params: 'FieldsParams' },
    input: z
      .object({
        params: z
          .object({
            contentType: z.string().optional(),
            groupId: z.string().optional(),
            limit: PageSize.optional(),
            cursor: z.string().optional(),
          })
          .strict(),
      })
      .strict(),
    output: page(Property),
  },
  {
    name: 'properties.get',
    description:
      'Read-only. Reads one custom field (property) by _id. Returns null when no field has that _id.',
    kind: 'read',
    field: 'fieldDetail',
    args: { _id: 'String!' },
    notFound: 'Field not found',
    input: z.object({ _id: Id }).strict(),
    output: Property.nullable(),
  },
  {
    name: 'propertyGroups.list',
    description:
      'Read-only. Lists the field groups for a contentType, optionally only the groups with the given codes. Archived groups are excluded. 20 per page by default. Pass pageInfo.endCursor as cursor to get the next page.',
    kind: 'read',
    field: 'fieldGroups',
    args: { params: 'FieldGroupParams' },
    input: z
      .object({
        params: z
          .object({
            contentType: Id,
            codes: z.array(Id).optional(),
            limit: PageSize.optional(),
            cursor: z.string().optional(),
          })
          .strict(),
      })
      .strict(),
    output: page(PropertyGroup),
  },
]);

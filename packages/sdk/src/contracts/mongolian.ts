import * as z from 'zod';
import { defineContract } from './define';

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const StringList = z.array(z.string()).nullable();

const PutResponseSummary = z.object({
  _id: z.string(),
  number: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  state: z.string().nullable(),
  message: z.string().nullable(),
  id: z.string().nullable(),
  inactiveId: z.string().nullable(),
  contentType: z.string().nullable(),
  contentId: z.string().nullable(),
  totalAmount: z.number().nullable(),
  totalVAT: z.number().nullable(),
  customerTin: z.string().nullable(),
  date: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const putResponseFilterArgs = {
  search: 'String',
  contentType: 'String',
  contentId: 'String',
  success: 'String',
  billType: 'String',
  createdStartDate: 'Date',
  createdEndDate: 'Date',
};

const putResponseFilter = z.object({
  search: z.string().optional(),
  contentType: z.string().optional(),
  contentId: z.string().optional(),
  success: z.string().optional(),
  billType: z.string().optional(),
  createdStartDate: z.string().optional(),
  createdEndDate: z.string().optional(),
});

const cursorArgs = { limit: 'Int', cursor: 'String' };

const cursorInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const ProductRuleSummary = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  kind: z.string().nullable(),
  taxType: z.string().nullable(),
  taxCode: z.string().nullable(),
  taxPercent: z.number().nullable(),
  productIds: StringList,
  productCategoryIds: StringList,
  excludeCategoryIds: StringList,
  excludeProductIds: StringList,
  tagIds: StringList,
  excludeTagIds: StringList,
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

const productRuleFields = {
  title: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  productCategoryIds: z.array(z.string()).optional(),
  excludeCategoryIds: z.array(z.string()).optional(),
  excludeProductIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  excludeTagIds: z.array(z.string()).optional(),
  kind: z.enum(['vat', 'ctax']),
  taxType: z.string().optional(),
  taxCode: z.string().optional(),
  taxPercent: z.number().optional(),
};

const productRuleArgs = {
  title: 'String',
  productIds: '[String]',
  productCategoryIds: '[String]',
  excludeCategoryIds: '[String]',
  excludeProductIds: '[String]',
  tagIds: '[String]',
  excludeTagIds: '[String]',
  kind: 'String',
  taxType: 'String',
  taxCode: 'String',
  taxPercent: 'Float',
};

const ProductGroupSummary = z.object({
  _id: z.string(),
  mainProductId: z.string().nullable(),
  subProductId: z.string().nullable(),
  sortNum: z.number().nullable(),
  ratio: z.number().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

const ExchangeRateSummary = z.object({
  _id: z.string(),
  date: z.string().nullable(),
  mainCurrency: z.string().nullable(),
  rateCurrency: z.string().nullable(),
  rate: z.number().nullable(),
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

export const mongolianContract = defineContract('mongolian', 1, [
  {
    name: 'putResponses.list',
    description:
      'Lists ebarimt put responses (VAT receipts and their return records), newest first. Filters: search matches id, inactiveId, number or receipt ids; contentType and contentId pick the linked record; success is the status (SUCCESS, ERROR, PAID); billType is the bill type; createdStartDate and createdEndDate are ISO dates. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Needs ebarimt:putResponses. Read-only.',
    kind: 'read',
    field: 'putResponses',
    args: { ...putResponseFilterArgs, ...cursorArgs },
    input: putResponseFilter.extend(cursorInput).strict(),
    output: z
      .object({
        list: z.array(PutResponseSummary).nullable(),
        pageInfo: PageInfo.nullable(),
        totalCount: z.number().nullable(),
      })
      .nullable(),
  },
  {
    name: 'putResponses.count',
    description:
      'Counts the put responses matching the same filters as putResponses.list, as one number. Needs ebarimt:putResponsesCount. Read-only.',
    kind: 'read',
    field: 'putResponsesCount',
    args: putResponseFilterArgs,
    input: putResponseFilter.strict(),
    output: z.number().int().nullable(),
  },
  {
    name: 'putResponses.get',
    description:
      'Reads the put response for one linked record, found by contentType and contentId. Returns null only if the resolver returns no record. Errors with "Ebarimt not found" when the record has no receipt. Needs ebarimt:putResponseDetail. Read-only.',
    kind: 'read',
    field: 'putResponseDetail',
    args: { contentType: 'String', contentId: 'String' },
    notFound: 'Ebarimt not found',
    input: z
      .object({
        contentType: z.string().min(1),
        contentId: z.string().min(1),
      })
      .strict(),
    output: PutResponseSummary.nullable(),
  },
  {
    name: 'putResponses.return',
    description:
      'Returns one ebarimt receipt by _id: sends the return to the tax system and marks the original as inactive. The output is the new return record, with status SUCCESS or ERROR and message on error. Destructive: the receipt is voided in the tax system. Needs ebarimt:putResponseReturnBill.',
    kind: 'destructive',
    field: 'putResponseReturnBill',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PutResponseSummary.nullable(),
  },
  {
    name: 'productRules.list',
    description:
      'Lists ebarimt product rules (VAT and city tax rules), newest first. searchValue matches the title. kind, taxCode, taxType and taxPercent match exactly. productId finds rules that include that product. Returns the first 20 rules; the list has no paging. Needs showEbarimtProductRules. Read-only.',
    kind: 'read',
    field: 'ebarimtProductRules',
    args: {
      searchValue: 'String',
      productId: 'String',
      kind: 'String',
      taxCode: 'String',
      taxType: 'String',
      taxPercent: 'Float',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        productId: z.string().optional(),
        kind: z.string().optional(),
        taxCode: z.string().optional(),
        taxType: z.string().optional(),
        taxPercent: z.number().optional(),
      })
      .strict(),
    output: z
      .object({
        list: z.array(ProductRuleSummary).nullable(),
        pageInfo: PageInfo.nullable(),
        totalCount: z.number().nullable(),
      })
      .nullable(),
  },
  {
    name: 'productRules.create',
    description:
      'Creates an ebarimt product rule. kind is "vat" or "ctax". The product, category and tag id lists pick which products the rule covers, and the exclude lists carve products out. taxType, taxCode and taxPercent set the tax. Needs manageEbarimtProductRules.',
    kind: 'write',
    field: 'ebarimtProductRuleCreate',
    args: productRuleArgs,
    input: z.object(productRuleFields).strict(),
    output: ProductRuleSummary.nullable(),
  },
  {
    name: 'productRules.edit',
    description:
      'Edits one ebarimt product rule by _id. Send the full rule: kind is required and the other fields replace the stored values. Needs manageEbarimtProductRules.',
    kind: 'write',
    field: 'ebarimtProductRuleUpdate',
    args: { _id: 'String!', ...productRuleArgs },
    input: z.object({ _id: z.string().min(1), ...productRuleFields }).strict(),
    output: ProductRuleSummary.nullable(),
  },
  {
    name: 'productRules.remove',
    description:
      'Removes ebarimt product rules by their ids. Destructive: the rules are deleted for good. Returns the delete counts as JSON. Needs manageEbarimtProductRules.',
    kind: 'destructive',
    field: 'ebarimtProductRulesRemove',
    args: { ids: '[String]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'productGroups.create',
    description:
      'Creates an ebarimt product group that pairs mainProductId with subProductId. The two products must differ, and mainProductId must not already be in another group. sortNum orders groups and ratio sets the share. Needs manageEbarimtProductGroups.',
    kind: 'write',
    field: 'ebarimtProductGroupCreate',
    args: {
      mainProductId: 'String',
      subProductId: 'String',
      sortNum: 'Float',
      ratio: 'Float',
      isActive: 'Boolean',
    },
    input: z
      .object({
        mainProductId: z.string().min(1),
        subProductId: z.string().min(1),
        sortNum: z.number().optional(),
        ratio: z.number().optional(),
        isActive: z.boolean().optional(),
      })
      .strict(),
    output: ProductGroupSummary.nullable(),
  },
  {
    name: 'productGroups.edit',
    description:
      'Edits one ebarimt product group by _id. The two products must differ. Leave a field out to keep it. Needs manageEbarimtProductGroups.',
    kind: 'write',
    field: 'ebarimtProductGroupUpdate',
    args: {
      _id: 'String!',
      mainProductId: 'String',
      subProductId: 'String',
      sortNum: 'Float',
      ratio: 'Float',
      isActive: 'Boolean',
    },
    input: z
      .object({
        _id: z.string().min(1),
        mainProductId: z.string().min(1).optional(),
        subProductId: z.string().min(1).optional(),
        sortNum: z.number().optional(),
        ratio: z.number().optional(),
        isActive: z.boolean().optional(),
      })
      .strict(),
    output: ProductGroupSummary.nullable(),
  },
  {
    name: 'productGroups.remove',
    description:
      'Removes ebarimt product groups by their ids. Destructive: the groups are deleted for good. Returns the delete counts as JSON. Needs manageEbarimtProductGroups.',
    kind: 'destructive',
    field: 'ebarimtProductGroupsRemove',
    args: { ids: '[String]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'exchangeRates.create',
    description:
      'Creates an exchange rate: rateCurrency is worth rate units of mainCurrency on date. date is an ISO date string. Needs exchangeRatesManage.',
    kind: 'write',
    field: 'exchangeRateAdd',
    args: {
      date: 'Date',
      mainCurrency: 'String',
      rateCurrency: 'String',
      rate: 'Float',
    },
    input: z
      .object({
        date: z.string().min(1),
        mainCurrency: z.string().optional(),
        rateCurrency: z.string().min(1),
        rate: z.number(),
      })
      .strict(),
    output: ExchangeRateSummary.nullable(),
  },
  {
    name: 'exchangeRates.edit',
    description:
      'Edits one exchange rate by _id. Send date, rateCurrency and rate with the new values. mainCurrency is optional. date is an ISO date string. Needs exchangeRatesManage.',
    kind: 'write',
    field: 'exchangeRateEdit',
    args: {
      _id: 'String!',
      date: 'Date',
      mainCurrency: 'String',
      rateCurrency: 'String',
      rate: 'Float',
    },
    input: z
      .object({
        _id: z.string().min(1),
        date: z.string().min(1),
        mainCurrency: z.string().optional(),
        rateCurrency: z.string().min(1),
        rate: z.number(),
      })
      .strict(),
    output: ExchangeRateSummary.nullable(),
  },
  {
    name: 'exchangeRates.remove',
    description:
      'Removes exchange rates by their ids. Destructive: the rates are deleted for good. Returns "success". Needs exchangeRatesManage.',
    kind: 'destructive',
    field: 'exchangeRatesRemove',
    args: { rateIds: '[String!]' },
    input: z.object({ rateIds: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.string().nullable(),
  },
]);

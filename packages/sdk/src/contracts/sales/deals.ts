import * as z from 'zod';
import { defineContract } from '../define';
import { DealSummary, StageSummary } from './base';

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const BoardSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  order: z.number().nullable(),
  type: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const PipelineSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  boardId: z.string().nullable(),
  visibility: z.string().nullable(),
  status: z.string().nullable(),
  bgColor: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const LabelSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  colorCode: z.string().nullable(),
  pipelineId: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const ChecklistItemSummary = z.object({
  _id: z.string(),
  checklistId: z.string().nullable(),
  content: z.string().nullable(),
  isChecked: z.boolean().nullable(),
  order: z.number().nullable(),
});

const ChecklistSummary = z.object({
  _id: z.string(),
  contentTypeId: z.string().nullable(),
  title: z.string().nullable(),
  percent: z.number().nullable(),
  items: z.array(ChecklistItemSummary).nullable(),
});

// Deal priority is the picker index. See DealSummary in ../sales.
const DealPriority = z.enum(['0', '1', '2', '3', '4']);

const dealFilterArgs = {
  stageId: 'String',
  pipelineId: 'String',
  search: 'String',
  assignedUserIds: '[String]',
  labelIds: '[String]',
};

const dealFilter = z.object({
  stageId: z.string().optional(),
  pipelineId: z.string().optional(),
  search: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
});

const cursorArgs = { limit: 'Int', cursor: 'String' };

const cursorInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

export const salesDealsContract = defineContract('sales', 1, [
  {
    name: 'deals.list',
    description:
      'Lists deals the calling user can see, filtered by the optional stageId, pipelineId, search, assignedUserIds and labelIds. Pages with a cursor: pass pageInfo.endCursor as cursor to get the next page while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Needs showDeals. Read-only.',
    kind: 'read',
    field: 'deals',
    args: { ...dealFilterArgs, ...cursorArgs },
    input: dealFilter.extend(cursorInput).strict(),
    output: z.object({
      list: z.array(DealSummary).nullable(),
      pageInfo: PageInfo.nullable(),
      totalCount: z.number().nullable(),
    }),
  },
  {
    name: 'deals.count',
    description:
      'Counts the deals matching the same filters as deals.list, as one number. Read-only.',
    kind: 'read',
    field: 'dealsTotalCount',
    args: dealFilterArgs,
    input: dealFilter.strict(),
    output: z.number().int(),
  },
  {
    name: 'deals.create',
    description:
      'Creates a deal in the stage stageId, in that stage\'s pipeline. startDate and closeDate are ISO date strings. priority is "0" to "4" (No Priority, Minor, Medium, High, Critical). Needs dealsAdd.',
    kind: 'write',
    field: 'dealsAdd',
    args: {
      name: 'String',
      stageId: 'String',
      assignedUserIds: '[String]',
      labelIds: '[String]',
      companyIds: '[String]',
      customerIds: '[String]',
      startDate: 'Date',
      closeDate: 'Date',
      description: 'String',
      priority: 'String',
    },
    input: z
      .object({
        name: z.string().optional(),
        stageId: z.string().min(1),
        assignedUserIds: z.array(z.string()).optional(),
        labelIds: z.array(z.string()).optional(),
        companyIds: z.array(z.string()).optional(),
        customerIds: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        closeDate: z.string().optional(),
        description: z.string().optional(),
        priority: DealPriority.optional(),
      })
      .strict(),
    output: DealSummary,
  },
  {
    name: 'deals.edit',
    description:
      'Edits the fields you pass on one deal. Leave a field out to keep it. To change the stage, use deals.move. Dates are ISO date strings. priority is "0" to "4". Needs dealsEdit.',
    kind: 'write',
    field: 'dealsEdit',
    args: {
      _id: 'String!',
      name: 'String',
      assignedUserIds: '[String]',
      startDate: 'Date',
      closeDate: 'Date',
      description: 'String',
      priority: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().optional(),
        assignedUserIds: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        closeDate: z.string().optional(),
        description: z.string().optional(),
        priority: DealPriority.optional(),
      })
      .strict(),
    output: DealSummary,
  },
  {
    name: 'deals.move',
    description:
      'Moves a deal to the stage destinationStageId. With aboveItemId, the deal lands directly below that deal in the new stage. Without it, the deal goes first. Needs dealsEdit.',
    kind: 'write',
    field: 'dealsChange',
    args: {
      itemId: 'String!',
      destinationStageId: 'String!',
      aboveItemId: 'String',
    },
    input: z
      .object({
        itemId: z.string().min(1),
        destinationStageId: z.string().min(1),
        aboveItemId: z.string().optional(),
      })
      .strict(),
    output: DealSummary,
  },
  {
    name: 'deals.remove',
    description:
      'Removes one deal and returns it as it was before removal. Needs dealsRemove.',
    kind: 'destructive',
    field: 'dealsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: DealSummary,
  },
  {
    name: 'stages.archiveDeals',
    description:
      'Archives every deal in the stage stageId that is not archived yet. Affects all of those deals, not one. Returns "ok". Needs dealsArchive.',
    kind: 'write',
    field: 'dealsArchive',
    args: { stageId: 'String!' },
    input: z.object({ stageId: z.string().min(1) }).strict(),
    output: z.string(),
  },
  {
    name: 'boards.list',
    description:
      'Lists every sales board. A board groups pipelines. Read-only.',
    kind: 'read',
    field: 'salesBoards',
    args: {},
    input: z.object({}).strict(),
    output: z.array(BoardSummary),
  },
  {
    name: 'boards.get',
    description:
      'Reads one sales board by _id. Returns null when no board has that _id. Read-only.',
    kind: 'read',
    field: 'salesBoardDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: BoardSummary.nullable(),
  },
  {
    name: 'pipelines.list',
    description:
      'Lists the pipelines the calling user can see, optionally only those in boardId. Pages with a cursor: pass pageInfo.endCursor as cursor to get the next page while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'salesPipelines',
    args: { boardId: 'String', ...cursorArgs },
    input: z
      .object({
        boardId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      list: z.array(PipelineSummary).nullable(),
      pageInfo: PageInfo.nullable(),
      totalCount: z.number().nullable(),
    }),
  },
  {
    name: 'pipelines.get',
    description:
      'Reads one pipeline by _id. Returns null when no pipeline has that _id. Read-only.',
    kind: 'read',
    field: 'salesPipelineDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PipelineSummary.nullable(),
  },
  {
    name: 'stages.list',
    description:
      'Lists the active stages of the pipeline pipelineId. Archived stages are left out. Read-only.',
    kind: 'read',
    field: 'salesStages',
    args: { pipelineId: 'String' },
    input: z.object({ pipelineId: z.string().min(1) }).strict(),
    output: z.array(StageSummary),
  },
  {
    name: 'labels.list',
    description:
      'Lists the labels defined on the pipeline pipelineId. Read-only.',
    kind: 'read',
    field: 'salesPipelineLabels',
    args: { pipelineId: 'String' },
    input: z.object({ pipelineId: z.string().min(1) }).strict(),
    output: z.array(LabelSummary),
  },
  {
    name: 'labels.get',
    description:
      'Reads one pipeline label by _id. Returns null when no label has that _id. Read-only.',
    kind: 'read',
    field: 'salesPipelineLabelDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: LabelSummary.nullable(),
  },
  {
    name: 'labels.create',
    description:
      'Creates a label on the pipeline pipelineId. A label name and colorCode pair must be unique within a pipeline. Needs pipelineLabelsAdd.',
    kind: 'write',
    field: 'salesPipelineLabelsAdd',
    args: {
      name: 'String!',
      colorCode: 'String!',
      pipelineId: 'String!',
    },
    input: z
      .object({
        name: z.string().min(1),
        colorCode: z.string().min(1),
        pipelineId: z.string().min(1),
      })
      .strict(),
    output: LabelSummary,
  },
  {
    name: 'labels.edit',
    description:
      'Replaces the name, colorCode and pipelineId of one label. A label name and colorCode pair must stay unique within a pipeline. Needs pipelineLabelsEdit.',
    kind: 'write',
    field: 'salesPipelineLabelsEdit',
    args: {
      _id: 'String!',
      name: 'String!',
      colorCode: 'String!',
      pipelineId: 'String!',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().min(1),
        colorCode: z.string().min(1),
        pipelineId: z.string().min(1),
      })
      .strict(),
    output: LabelSummary,
  },
  {
    name: 'labels.remove',
    description:
      'Removes one pipeline label by _id. Needs pipelineLabelsRemove.',
    kind: 'destructive',
    field: 'salesPipelineLabelsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'checklists.list',
    description:
      'Lists the checklists attached to one item. contentTypeId is the deal _id for deal checklists. Each checklist includes its items and percent checked. Read-only.',
    kind: 'read',
    field: 'salesChecklists',
    args: { contentTypeId: 'String' },
    input: z.object({ contentTypeId: z.string().min(1) }).strict(),
    output: z.array(ChecklistSummary),
  },
  {
    name: 'checklists.get',
    description:
      'Reads one checklist by _id, with its items. Returns null when no checklist has that _id. Read-only.',
    kind: 'read',
    field: 'salesChecklistDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ChecklistSummary.nullable(),
  },
  {
    name: 'checklists.create',
    description:
      'Creates a checklist on the item contentTypeId (a deal _id for deal checklists). Needs checklistsAdd.',
    kind: 'write',
    field: 'salesChecklistsAdd',
    args: { contentTypeId: 'String', title: 'String' },
    input: z
      .object({
        contentTypeId: z.string().min(1),
        title: z.string().optional(),
      })
      .strict(),
    output: ChecklistSummary,
  },
  {
    name: 'checklists.edit',
    description: 'Changes the title of one checklist. Needs checklistsEdit.',
    kind: 'write',
    field: 'salesChecklistsEdit',
    args: { _id: 'String!', title: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        title: z.string().optional(),
      })
      .strict(),
    output: ChecklistSummary,
  },
  {
    name: 'checklists.remove',
    description: 'Removes one checklist and its items. Needs checklistsRemove.',
    kind: 'destructive',
    field: 'salesChecklistsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ChecklistSummary,
  },
  {
    name: 'checklistItems.create',
    description:
      'Adds an item to the checklist checklistId. isChecked defaults to unchecked. Needs checklistsEdit.',
    kind: 'write',
    field: 'salesChecklistItemsAdd',
    args: {
      checklistId: 'String',
      content: 'String',
      isChecked: 'Boolean',
    },
    input: z
      .object({
        checklistId: z.string().min(1),
        content: z.string().optional(),
        isChecked: z.boolean().optional(),
      })
      .strict(),
    output: ChecklistItemSummary,
  },
  {
    name: 'checklistItems.edit',
    description:
      'Changes the content or checked state of one checklist item. Leave a field out to keep it. Needs checklistsEdit.',
    kind: 'write',
    field: 'salesChecklistItemsEdit',
    args: {
      _id: 'String!',
      content: 'String',
      isChecked: 'Boolean',
    },
    input: z
      .object({
        _id: z.string().min(1),
        content: z.string().optional(),
        isChecked: z.boolean().optional(),
      })
      .strict(),
    output: ChecklistItemSummary,
  },
  {
    name: 'checklistItems.remove',
    description: 'Removes one checklist item by _id. Needs checklistsEdit.',
    kind: 'destructive',
    field: 'salesChecklistItemsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ChecklistItemSummary,
  },
]);

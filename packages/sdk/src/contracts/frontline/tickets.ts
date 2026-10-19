import * as z from 'zod';
import { defineContract } from '../define';

// Nullability follows the GraphQL SDL, except fields the Mongoose model
// requires (ids, titles, names, statuses), which are non-null here.
const IdList = z.array(z.string()).nullable();

const ListOf = <T extends z.ZodType>(item: T) => z.array(item).nullable();

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  endCursor: z.string().nullable(),
});

const pageOf = <T extends z.ZodType>(item: T) =>
  z
    .object({
      list: ListOf(item),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    })
    .nullable();

const pageInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const ArticleStatus = z.enum(['draft', 'publish', 'scheduled', 'archived']);

const SurveyStatus = z.enum(['pending', 'active', 'rejected', 'archived']);

const TicketSummary = z.object({
  _id: z.string(),
  number: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  channelId: z.string().nullable(),
  pipelineId: z.string().nullable(),
  statusId: z.string().nullable(),
  priority: z.number().nullable(),
  assigneeId: z.string().nullable(),
  assignedMembers: IdList,
  labelIds: IdList,
  tagIds: IdList,
  startDate: z.string().nullable(),
  targetDate: z.string().nullable(),
  statusChangedDate: z.string().nullable(),
  propertiesData: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const TicketFilter = z
  .object({
    channelId: z.string().min(1).optional(),
    pipelineId: z.string().min(1).optional(),
    statusId: z.string().min(1).optional(),
    assigneeId: z.string().min(1).optional(),
    priority: z.number().int().optional(),
    labelIds: z.array(z.string().min(1)).optional(),
    tagIds: z.array(z.string().min(1)).optional(),
    searchValue: z.string().optional(),
    ...pageInput,
  })
  .strict();

// Fields a create or edit can set. Create adds the required name, channelId,
// pipelineId and statusId; edit adds _id.
const ticketDetails = {
  description: z.string().optional(),
  priority: z.number().int().optional(),
  assigneeId: z.string().min(1).optional(),
  assignedMembers: z.array(z.string().min(1)).optional(),
  labelIds: z.array(z.string().min(1)).optional(),
  tagIds: z.array(z.string().min(1)).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
};

const ticketDetailArgs = {
  description: 'String',
  priority: 'Int',
  assigneeId: 'String',
  assignedMembers: '[String]',
  labelIds: '[String]',
  tagIds: '[String]',
  startDate: 'Date',
  targetDate: 'Date',
};

const TicketPipelineSummary = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  channelId: z.string().nullable(),
  visibility: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const TicketStatusSummary = z.object({
  _id: z.string(),
  name: z.string(),
  pipelineId: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  order: z.number(),
  type: z.number(),
  visibilityType: z.string().nullable(),
});

// The status kind is 1 new, 2 open, 3 in progress, 4 resolved, 5 closed, 6 cancelled.
const StatusChoice = z.object({
  value: z.string(),
  label: z.string(),
  color: z.string().nullable(),
  type: z.number(),
  canMoveMemberIds: IdList,
  canEditMemberIds: IdList,
});

const NoteSummary = z.object({
  _id: z.string(),
  content: z.string().nullable(),
  contentId: z.string().nullable(),
  createdBy: z.string().nullable(),
  mentions: IdList,
  isInternal: z.boolean().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const TopicSummary = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  languageCode: z.string().nullable(),
  createdDate: z.string().nullable(),
  modifiedDate: z.string().nullable(),
});

const TopicDoc = z
  .object({
    title: z.string().min(1),
    code: z.string().optional(),
    description: z.string().optional(),
    brandId: z.string().optional(),
    color: z.string().optional(),
    languageCode: z.string().optional(),
    categoryIds: z.array(z.string().min(1)).optional(),
  })
  .strict();

const CategorySummary = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  parentCategoryId: z.string().nullable(),
  createdDate: z.string().nullable(),
  modifiedDate: z.string().nullable(),
});

const CategoryDoc = z
  .object({
    title: z.string().min(1),
    icon: z.string().min(1),
    code: z.string().optional(),
    description: z.string().optional(),
    topicIds: z.array(z.string().min(1)).optional(),
    parentCategoryId: z.string().min(1).optional(),
  })
  .strict();

const ArticleSummary = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  status: z.string().nullable(),
  isPrivate: z.boolean().nullable(),
  topicId: z.string().nullable(),
  categoryId: z.string().nullable(),
  viewCount: z.number().nullable(),
  scheduledDate: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdDate: z.string().nullable(),
  modifiedDate: z.string().nullable(),
});

const ArticleDetail = ArticleSummary.extend({
  content: z.string().nullable(),
});

const ArticleDoc = z
  .object({
    title: z.string().min(1),
    content: z.string(),
    status: ArticleStatus,
    summary: z.string().optional(),
    isPrivate: z.boolean().optional(),
    code: z.string().optional(),
    topicId: z.string().min(1).optional(),
    categoryIds: z.array(z.string().min(1)).optional(),
    // Required when status is scheduled. Must be in the future.
    scheduledDate: z.string().optional(),
  })
  .strict();

const FormSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  type: z.string().nullable(),
  description: z.string().nullable(),
  buttonText: z.string().nullable(),
  status: z.string().nullable(),
  visibility: z.string().nullable(),
  languageCode: z.string().nullable(),
  channelId: z.string().nullable(),
  integrationId: z.string().nullable(),
  tagIds: IdList,
  departmentIds: IdList,
  createdDate: z.string().nullable(),
});

const FormFieldSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  text: z.string().nullable(),
  type: z.string().nullable(),
  description: z.string().nullable(),
  isRequired: z.boolean().nullable(),
  isVisible: z.boolean().nullable(),
  order: z.number().nullable(),
  options: IdList,
});

const FormDetail = FormSummary.extend({
  fields: z.array(FormFieldSummary).nullable(),
});

const SubmissionAnswer = z.object({
  _id: z.string(),
  formFieldId: z.string().nullable(),
  formFieldText: z.string().nullable(),
  formFieldType: z.string().nullable(),
  value: z.unknown().nullable(),
  submittedAt: z.string().nullable(),
});

// A submission group: the answers one customer gave in one form submit.
// _id is the group id, not an answer id.
const SubmissionSummary = z.object({
  _id: z.string(),
  formId: z.string().nullable(),
  contentTypeId: z.string().nullable(),
  customerId: z.string().nullable(),
  conversationId: z.string().nullable(),
  createdAt: z.string().nullable(),
  submissions: ListOf(SubmissionAnswer),
});

const SurveyOptionSummary = z.object({
  _id: z.string(),
  text: z.string(),
  order: z.number().nullable(),
});

const SurveySummary = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  title: z.string(),
  question: z.string(),
  channelId: z.string().nullable(),
  brandId: z.string().nullable(),
  status: z.string().nullable(),
  allowMultiselect: z.boolean().nullable(),
  durationHours: z.number().nullable(),
  sentCount: z.number().nullable(),
  rejectionReason: z.string().nullable(),
  options: z.array(SurveyOptionSummary),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const SurveyDetail = SurveySummary.extend({
  steps: z.array(
    z.object({
      _id: z.string(),
      name: z.string().nullable(),
      question: z.string(),
      order: z.number().nullable(),
      options: z.array(SurveyOptionSummary),
    }),
  ),
});

export const frontlineTicketsContract = defineContract('frontline', 1, [
  {
    name: 'tickets.list',
    description:
      'List tickets, most recently updated first. limit caps the page at 50. Pass pageInfo.endCursor as cursor to get the next page. channelId, pipelineId, statusId and assigneeId narrow the list. searchValue matches the ticket name. Read-only.',
    kind: 'read',
    field: 'getTickets',
    args: { filter: 'ITicketFilter' },
    input: z.object({ filter: TicketFilter.optional() }).strict(),
    output: pageOf(TicketSummary),
  },
  {
    name: 'tickets.get',
    description:
      "Read one ticket by its _id. Returns null when no ticket has that _id. Fails with an access error when the caller cannot view the ticket's status. Read-only.",
    kind: 'read',
    field: 'getTicket',
    args: { _id: 'String!' },
    notFound: 'Ticket not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TicketSummary.nullable(),
  },
  {
    name: 'tickets.create',
    description:
      'Create a ticket in a pipeline, starting in statusId. statusId must belong to pipelineId. priority is an integer. startDate and targetDate are ISO date strings. Returns the new ticket.',
    kind: 'write',
    field: 'createTicket',
    args: {
      name: 'String!',
      channelId: 'String!',
      pipelineId: 'String!',
      statusId: 'String!',
      ...ticketDetailArgs,
    },
    input: z
      .object({
        name: z.string().min(1),
        channelId: z.string().min(1),
        pipelineId: z.string().min(1),
        statusId: z.string().min(1),
        ...ticketDetails,
      })
      .strict(),
    output: TicketSummary,
  },
  {
    name: 'tickets.edit',
    description:
      'Change fields of one ticket. Send only the fields to change. To change only the status, use tickets.move. Returns the updated ticket.',
    kind: 'write',
    field: 'updateTicket',
    args: {
      _id: 'String!',
      name: 'String',
      channelId: 'String',
      pipelineId: 'String',
      statusId: 'String',
      ...ticketDetailArgs,
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().min(1).optional(),
        channelId: z.string().min(1).optional(),
        pipelineId: z.string().min(1).optional(),
        statusId: z.string().min(1).optional(),
        ...ticketDetails,
      })
      .strict(),
    output: TicketSummary,
  },
  {
    name: 'tickets.move',
    description:
      'Move one ticket to another status (its column). Fails with an access error when the caller cannot move tickets between the two statuses. Returns the updated ticket.',
    kind: 'write',
    field: 'updateTicket',
    args: { _id: 'String!', statusId: 'String!' },
    input: z
      .object({
        _id: z.string().min(1),
        statusId: z.string().min(1),
      })
      .strict(),
    output: TicketSummary,
  },
  {
    name: 'tickets.remove',
    description:
      "Permanently delete tickets by _id. The caller needs access to each ticket's pipeline. Returns ok and the removedIds.",
    kind: 'destructive',
    field: 'removeTicket',
    args: { _id: '[String!]!' },
    input: z
      .object({
        _id: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    output: z.object({
      ok: z.number(),
      removedIds: z.array(z.string()),
    }),
  },
  {
    name: 'ticketPipelines.list',
    description:
      'List ticket pipelines. channelId limits the list to one channel. applyVisibilityFilter true hides private pipelines the caller neither created nor belongs to. Read-only.',
    kind: 'read',
    field: 'getTicketPipelines',
    args: { filter: 'TicketsPipelineFilter' },
    input: z
      .object({
        filter: z
          .object({
            channelId: z.string().min(1).optional(),
            name: z.string().optional(),
            applyVisibilityFilter: z.boolean().optional(),
            ...pageInput,
          })
          .strict()
          .optional(),
      })
      .strict(),
    output: pageOf(TicketPipelineSummary),
  },
  {
    name: 'ticketPipelines.get',
    description:
      'Read one ticket pipeline by its _id. Returns null when no pipeline has that _id. Read-only.',
    kind: 'read',
    field: 'getTicketPipeline',
    args: { _id: 'String!' },
    notFound: 'Pipeline not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TicketPipelineSummary.nullable(),
  },
  {
    name: 'ticketStatuses.list',
    description:
      'List the statuses (columns) of a pipeline that the caller can see. value is the statusId to pass to tickets.create, tickets.edit or tickets.move. type is 1 new, 2 open, 3 in progress, 4 resolved, 5 closed, 6 cancelled. Read-only.',
    kind: 'read',
    field: 'getAccessibleTicketStatuses',
    args: { pipelineId: 'String!' },
    input: z.object({ pipelineId: z.string().min(1) }).strict(),
    output: z.array(StatusChoice),
  },
  {
    name: 'ticketStatuses.get',
    description:
      'Read one ticket status by its _id. Returns null when no status has that _id. Read-only.',
    kind: 'read',
    field: 'getTicketStatus',
    args: { _id: 'String!' },
    notFound: 'Status not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TicketStatusSummary.nullable(),
  },
  {
    name: 'ticketComments.list',
    description:
      'List the comments on a ticket, newest first. Pass isInternal to list only internal or only public comments. Needs the showTickets permission. Read-only.',
    kind: 'read',
    field: 'ticketGetNotes',
    args: { contentId: 'String!', isInternal: 'Boolean' },
    input: z
      .object({
        contentId: z.string().min(1),
        isInternal: z.boolean().optional(),
      })
      .strict(),
    output: ListOf(NoteSummary),
  },
  {
    name: 'ticketComments.create',
    description:
      'Add a comment to a ticket (contentId). Public comments on a ticket whose pipeline has a mail integration are also sent by email. Internal comments are not sent. mentions takes user ids. Returns the new comment.',
    kind: 'write',
    field: 'ticketCreateNote',
    args: {
      contentId: 'String!',
      content: 'String',
      isInternal: 'Boolean',
      mentions: '[String]',
    },
    input: z
      .object({
        contentId: z.string().min(1),
        content: z.string().min(1),
        isInternal: z.boolean().optional(),
        mentions: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: NoteSummary,
  },
  {
    name: 'ticketComments.edit',
    description:
      'Change the content or isInternal of one comment. Returns the comment as it was before the edit.',
    kind: 'write',
    field: 'ticketUpdateNote',
    args: { _id: 'String!', content: 'String', isInternal: 'Boolean' },
    input: z
      .object({
        _id: z.string().min(1),
        content: z.string().min(1).optional(),
        isInternal: z.boolean().optional(),
      })
      .strict(),
    output: NoteSummary,
  },
  {
    name: 'ticketComments.remove',
    description: 'Permanently delete one comment by _id.',
    kind: 'destructive',
    field: 'ticketDeleteNote',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'knowledgeBaseTopics.list',
    description:
      'List knowledge base topics, most recently modified first. searchValue matches title, description and code. page and perPage are both optional. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseTopics',
    args: {
      searchValue: 'String',
      brandId: 'String',
      page: 'Int',
      perPage: 'Int',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        brandId: z.string().min(1).optional(),
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: ListOf(TopicSummary),
  },
  {
    name: 'knowledgeBaseTopics.get',
    description:
      'Read one knowledge base topic by its _id or its code. Returns null when neither matches. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseTopicDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TopicSummary.nullable(),
  },
  {
    name: 'knowledgeBaseTopics.create',
    description:
      'Create a knowledge base topic. title is required. code must be unique when set. categoryIds attaches existing categories. Returns the new topic.',
    kind: 'write',
    field: 'knowledgeBaseTopicsAdd',
    args: { doc: 'KnowledgeBaseTopicDoc!' },
    input: z.object({ doc: TopicDoc }).strict(),
    output: TopicSummary,
  },
  {
    name: 'knowledgeBaseTopics.edit',
    description:
      'Change a knowledge base topic by _id. Send the full doc: title is required on every edit. Returns the updated topic.',
    kind: 'write',
    field: 'knowledgeBaseTopicsEdit',
    args: { _id: 'String!', doc: 'KnowledgeBaseTopicDoc!' },
    input: z.object({ _id: z.string().min(1), doc: TopicDoc }).strict(),
    output: TopicSummary,
  },
  {
    name: 'knowledgeBaseTopics.remove',
    description: 'Permanently delete one knowledge base topic by _id.',
    kind: 'destructive',
    field: 'knowledgeBaseTopicsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'knowledgeBaseCategories.list',
    description:
      'List knowledge base categories sorted by title. topicIds limits the list to categories of those topics. Without page and perPage, returns every match. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseCategories',
    args: { topicIds: '[String]', page: 'Int', perPage: 'Int' },
    input: z
      .object({
        topicIds: z.array(z.string().min(1)).optional(),
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: ListOf(CategorySummary),
  },
  {
    name: 'knowledgeBaseCategories.get',
    description:
      'Read one knowledge base category by its _id or its code. Returns null when neither matches. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseCategoryDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: CategorySummary.nullable(),
  },
  {
    name: 'knowledgeBaseCategories.create',
    description:
      'Create a knowledge base category. title and icon are required. parentCategoryId nests it under another category. Returns the new category.',
    kind: 'write',
    field: 'knowledgeBaseCategoriesAdd',
    args: { doc: 'KnowledgeBaseCategoryDoc!' },
    input: z.object({ doc: CategoryDoc }).strict(),
    output: CategorySummary,
  },
  {
    name: 'knowledgeBaseCategories.edit',
    description:
      'Change a knowledge base category by _id. Send the full doc: title and icon are required on every edit. Returns the updated category.',
    kind: 'write',
    field: 'knowledgeBaseCategoriesEdit',
    args: { _id: 'String!', doc: 'KnowledgeBaseCategoryDoc!' },
    input: z.object({ _id: z.string().min(1), doc: CategoryDoc }).strict(),
    output: CategorySummary,
  },
  {
    name: 'knowledgeBaseCategories.remove',
    description:
      'Permanently delete one knowledge base category by _id. Its child categories stay and lose their parent.',
    kind: 'destructive',
    field: 'knowledgeBaseCategoriesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'knowledgeBaseArticles.list',
    description:
      'List knowledge base articles, newest first. Returns summaries without content: use knowledgeBaseArticles.get for the body. status is draft, publish, scheduled or archived. searchValue matches title, summary, content and code. page and perPage are both optional. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseArticles',
    args: {
      searchValue: 'String',
      categoryIds: '[String]',
      topicIds: '[String]',
      status: 'String',
      page: 'Int',
      perPage: 'Int',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryIds: z.array(z.string().min(1)).optional(),
        topicIds: z.array(z.string().min(1)).optional(),
        status: ArticleStatus.optional(),
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: ListOf(ArticleSummary),
  },
  {
    name: 'knowledgeBaseArticles.get',
    description:
      'Read one knowledge base article with its content, by its _id or its code. Returns null when neither matches. Does not count a view. Read-only.',
    kind: 'read',
    field: 'knowledgeBaseArticleDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ArticleDetail.nullable(),
  },
  {
    name: 'knowledgeBaseArticles.create',
    description:
      'Create a knowledge base article. title, content and status are required. status scheduled needs scheduledDate, which must be in the future. Returns the new article.',
    kind: 'write',
    field: 'knowledgeBaseArticlesAdd',
    args: { doc: 'KnowledgeBaseArticleDoc!' },
    input: z.object({ doc: ArticleDoc }).strict(),
    output: ArticleDetail,
  },
  {
    name: 'knowledgeBaseArticles.edit',
    description:
      'Change a knowledge base article by _id. Send the full doc: title, content and status are required on every edit. The same scheduledDate rule as create applies. Returns the updated article.',
    kind: 'write',
    field: 'knowledgeBaseArticlesEdit',
    args: { _id: 'String!', doc: 'KnowledgeBaseArticleDoc!' },
    input: z.object({ _id: z.string().min(1), doc: ArticleDoc }).strict(),
    output: ArticleDetail,
  },
  {
    name: 'knowledgeBaseArticles.remove',
    description: 'Permanently delete one knowledge base article by _id.',
    kind: 'destructive',
    field: 'knowledgeBaseArticlesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'forms.list',
    description:
      'List forms, oldest first. searchValue matches the form name. channelId limits the list to one channel. limit caps the page at 50. Pass pageInfo.endCursor as cursor for the next page. Read-only.',
    kind: 'read',
    field: 'forms',
    args: {
      searchValue: 'String',
      channelId: 'String',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        channelId: z.string().min(1).optional(),
        ...pageInput,
      })
      .strict(),
    output: pageOf(FormSummary),
  },
  {
    name: 'forms.get',
    description:
      'Read one form by its _id, with its fields in order. Returns null when no form has that _id. Read-only.',
    kind: 'read',
    field: 'formDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: FormDetail.nullable(),
  },
  {
    name: 'formSubmissions.list',
    description:
      'List form submissions, newest first. Each item is one submit: its answers are in submissions, and _id is the submission id to pass to formSubmissions.get. formId limits the list to one form. contentTypeIds limits it to submissions attached to those content types. limit caps the page at 50. Read-only.',
    kind: 'read',
    field: 'formSubmissions',
    args: {
      formId: 'String',
      contentTypeIds: '[String]',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        formId: z.string().min(1).optional(),
        contentTypeIds: z.array(z.string().min(1)).optional(),
        ...pageInput,
      })
      .strict(),
    output: pageOf(SubmissionSummary),
  },
  {
    name: 'formSubmissions.get',
    description:
      'Read one form submission by the _id that formSubmissions.list returns. Returns null when no submission has that _id. Read-only.',
    kind: 'read',
    field: 'formSubmissionDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: SubmissionSummary.nullable(),
  },
  {
    name: 'surveys.list',
    description:
      'List surveys, newest first. status is pending, active, rejected or archived. searchValue matches the title, question and step questions. channelId limits the list to one channel. limit caps the page at 50. Read-only.',
    kind: 'read',
    field: 'surveyList',
    args: {
      searchValue: 'String',
      status: 'String',
      channelId: 'String',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: SurveyStatus.optional(),
        channelId: z.string().min(1).optional(),
        ...pageInput,
      })
      .strict(),
    output: pageOf(SurveySummary),
  },
  {
    name: 'surveys.count',
    description:
      'Count surveys that surveys.list would return with the same filters, in total and per status. Pagination is not applied. Read-only.',
    kind: 'read',
    field: 'surveyTotalCount',
    args: { searchValue: 'String', status: 'String', channelId: 'String' },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: SurveyStatus.optional(),
        channelId: z.string().min(1).optional(),
      })
      .strict(),
    output: z.object({
      total: z.number().nullable(),
      byStatus: z.record(z.string(), z.unknown()).nullable(),
    }),
  },
  {
    name: 'surveys.get',
    description:
      'Read one survey by its _id, with its options and steps. Returns null when no survey has that _id. Read-only.',
    kind: 'read',
    field: 'surveyDetail',
    args: { _id: 'String!' },
    notFound: 'Survey not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: SurveyDetail.nullable(),
  },
]);

import * as z from 'zod';
import { defineContract } from '../define';

// core@1 contacts, internal notes, tags, and record links. Additive changes
// only; anything that breaks an extension written against v1 ships as core@2.

const Customer = z.object({
  _id: z.string(),
  state: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  emails: z.array(z.string()).nullable(),
  primaryPhone: z.string().nullable(),
  phones: z.array(z.string()).nullable(),
  position: z.string().nullable(),
  department: z.string().nullable(),
  description: z.string().nullable(),
  ownerId: z.string().nullable(),
  tagIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const Company = z.object({
  _id: z.string(),
  primaryName: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  primaryPhone: z.string().nullable(),
  website: z.string().nullable(),
  industry: z.array(z.string()).nullable(),
  size: z.number().nullable(),
  businessType: z.string().nullable(),
  description: z.string().nullable(),
  ownerId: z.string().nullable(),
  tagIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const InternalNote = z.object({
  _id: z.string(),
  contentType: z.string(),
  contentTypeId: z.string().nullable(),
  content: z.string().nullable(),
  createdUserId: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const Tag = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  colorCode: z.string().nullable(),
  parentId: z.string().nullable(),
  isGroup: z.boolean().nullable(),
  relatedIds: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  objectCount: z.number().nullable(),
  createdAt: z.string().nullable(),
});

const Relation = z.object({
  _id: z.string(),
  entities: z.array(
    z.object({
      contentType: z.string(),
      contentId: z.string(),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const Conformity = z.object({
  _id: z.string(),
  mainType: z.string().nullable(),
  mainTypeId: z.string().nullable(),
  relType: z.string().nullable(),
  relTypeId: z.string().nullable(),
});

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

// Cursor paging shared by the list calls. The server default is 20 per page.
const page = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().min(1).optional(),
};

// `plugin:module`, for example core:customer or sales:deal.
const contentType = z.string().regex(/^[a-z]+:[a-zA-Z]+$/, {
  message: 'Use plugin:module, for example core:customer',
});

const customerFields = {
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  primaryEmail: z.string().optional(),
  primaryPhone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  description: z.string().optional(),
  ownerId: z.string().optional(),
};

const companyFields = {
  primaryName: z.string().optional(),
  primaryEmail: z.string().optional(),
  primaryPhone: z.string().optional(),
  website: z.string().optional(),
  industry: z.array(z.string()).optional(),
  size: z.number().int().optional(),
  description: z.string().optional(),
  ownerId: z.string().optional(),
  businessType: z.string().optional(),
};

const customerArgs = {
  firstName: 'String',
  lastName: 'String',
  primaryEmail: 'String',
  primaryPhone: 'String',
  position: 'String',
  department: 'String',
  description: 'String',
  ownerId: 'String',
};

const companyArgs = {
  primaryName: 'String',
  primaryEmail: 'String',
  primaryPhone: 'String',
  website: 'String',
  industry: '[String]',
  size: 'Int',
  description: 'String',
  ownerId: 'String',
  businessType: 'String',
};

export const coreContactsContract = defineContract('core', 1, [
  {
    name: 'customers.list',
    description:
      'Lists customers, 20 per page by default. Use limit (max 50) and cursor. Pass pageInfo.endCursor as cursor to get the next page while pageInfo.hasNextPage is true. searchValue filters by text. Read-only.',
    kind: 'read',
    field: 'customers',
    args: {
      limit: 'Int',
      cursor: 'String',
      searchValue: 'String',
      tagIds: '[String]',
    },
    input: z
      .object({
        ...page,
        searchValue: z.string().optional(),
        tagIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: z.object({
      list: z.array(Customer).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'customers.get',
    description:
      'Reads one customer by _id. Returns null when no customer has that _id. Read-only.',
    kind: 'read',
    field: 'customerDetail',
    args: { _id: 'String!' },
    notFound: 'Customer not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Customer.nullable(),
  },
  {
    name: 'customers.create',
    description:
      'Creates a customer and returns it. All fields are optional. Fails when the customer duplicates an existing one. Needs the contacts create permission.',
    kind: 'write',
    field: 'customersAdd',
    args: customerArgs,
    input: z.object(customerFields).strict(),
    output: Customer,
  },
  {
    name: 'customers.edit',
    description:
      'Updates one customer and returns it. Fields left out keep their values. Fails when no customer has that _id. Needs the contacts update permission.',
    kind: 'write',
    field: 'customersEdit',
    args: { _id: 'String!', ...customerArgs },
    input: z.object({ _id: z.string().min(1), ...customerFields }).strict(),
    output: Customer,
  },
  {
    name: 'customers.remove',
    description:
      'Permanently deletes customers by _id and returns the _ids it was given. Destructive. Needs the contacts delete permission.',
    kind: 'destructive',
    field: 'customersRemove',
    args: { customerIds: '[String]' },
    input: z
      .object({
        customerIds: z.array(z.string().min(1)).min(1).max(50),
      })
      .strict(),
    output: z.array(z.string()),
  },
  {
    name: 'customers.changeState',
    description:
      'Sets the lifecycle state of one customer and returns it. value is one of subscriber, lead, marketingQualifiedLead, salesQualifiedLead, opportunity, customer, evangelist, other. Needs the contacts update permission.',
    kind: 'write',
    field: 'customersChangeState',
    args: { _id: 'String!', value: 'String!' },
    input: z
      .object({
        _id: z.string().min(1),
        value: z.enum([
          'subscriber',
          'lead',
          'marketingQualifiedLead',
          'salesQualifiedLead',
          'opportunity',
          'customer',
          'evangelist',
          'other',
        ]),
      })
      .strict(),
    output: Customer,
  },
  {
    name: 'companies.list',
    description:
      'Lists companies, 20 per page by default. Use limit (max 50) and cursor. Pass pageInfo.endCursor as cursor to get the next page while pageInfo.hasNextPage is true. searchValue filters by text. Read-only.',
    kind: 'read',
    field: 'companies',
    args: {
      limit: 'Int',
      cursor: 'String',
      searchValue: 'String',
      tagIds: '[String]',
    },
    input: z
      .object({
        ...page,
        searchValue: z.string().optional(),
        tagIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: z.object({
      list: z.array(Company).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'companies.get',
    description:
      'Reads one company by _id or by its code. Returns null when neither matches. Read-only.',
    kind: 'read',
    field: 'companyDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Company.nullable(),
  },
  {
    name: 'companies.create',
    description:
      'Creates a company and returns it. All fields are optional. Needs the contacts create permission.',
    kind: 'write',
    field: 'companiesAdd',
    args: companyArgs,
    input: z.object(companyFields).strict(),
    output: Company,
  },
  {
    name: 'companies.edit',
    description:
      'Updates one company and returns it. Fields left out keep their values. Fails when no company has that _id. Needs the contacts update permission.',
    kind: 'write',
    field: 'companiesEdit',
    args: { _id: 'String!', ...companyArgs },
    input: z.object({ _id: z.string().min(1), ...companyFields }).strict(),
    output: Company,
  },
  {
    name: 'companies.remove',
    description:
      'Permanently deletes companies by _id and returns the _ids it was given. Destructive. Needs the contacts delete permission.',
    kind: 'destructive',
    field: 'companiesRemove',
    args: { companyIds: '[String]' },
    input: z
      .object({
        companyIds: z.array(z.string().min(1)).min(1).max(50),
      })
      .strict(),
    output: z.array(z.string()),
  },
  {
    name: 'internalNotes.list',
    description:
      'Lists internal notes on a record, oldest first. contentType is plugin:module such as core:customer. Pass contentTypeId to get the notes of one record; leave it out to get the notes of every record of that type. Read-only.',
    kind: 'read',
    field: 'internalNotes',
    args: { contentType: 'String!', contentTypeId: 'String' },
    input: z
      .object({
        contentType,
        contentTypeId: z.string().min(1).optional(),
      })
      .strict(),
    output: z.array(InternalNote),
  },
  {
    name: 'internalNotes.get',
    description:
      'Reads one internal note by _id. Returns null when no note has that _id. Read-only.',
    kind: 'read',
    field: 'internalNoteDetail',
    args: { _id: 'String!' },
    notFound: 'Internal note not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: InternalNote.nullable(),
  },
  {
    name: 'internalNotes.create',
    description:
      'Adds an internal note to one record and returns it. contentType is plugin:module such as core:customer, and contentTypeId is that record _id. mentionedUserIds are notified. Returns null when the plugin that owns contentType is not enabled. Needs the internal notes manage permission.',
    kind: 'write',
    field: 'internalNotesAdd',
    args: {
      contentType: 'String!',
      contentTypeId: 'String',
      content: 'String',
      mentionedUserIds: '[String]',
    },
    input: z
      .object({
        contentType,
        contentTypeId: z.string().min(1),
        content: z.string().min(1),
        mentionedUserIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: InternalNote.nullable(),
  },
  {
    name: 'internalNotes.edit',
    description:
      'Replaces the content of one internal note and returns it. mentionedUserIds replaces the mentioned users when given. Needs the internal notes manage permission.',
    kind: 'write',
    field: 'internalNotesEdit',
    args: {
      _id: 'String!',
      content: 'String',
      mentionedUserIds: '[String]',
    },
    input: z
      .object({
        _id: z.string().min(1),
        content: z.string().min(1),
        mentionedUserIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: InternalNote.nullable(),
  },
  {
    name: 'internalNotes.remove',
    description:
      'Permanently deletes one internal note and returns it. Fails when no note has that _id. Destructive. Needs the internal notes manage permission.',
    kind: 'destructive',
    field: 'internalNotesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: InternalNote,
  },
  {
    name: 'tags.list',
    description:
      'Lists tags, 20 per page by default. Use limit (max 50) and cursor. Pass pageInfo.endCursor as cursor to get the next page while pageInfo.hasNextPage is true. Without type, lists workspace tags (those with no content type). With type such as core:customer, lists the tags for that content type. parentId lists the children of a group. Read-only.',
    kind: 'read',
    field: 'tags',
    args: {
      type: 'String',
      searchValue: 'String',
      parentId: 'String',
      isGroup: 'Boolean',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        ...page,
        type: contentType.optional(),
        searchValue: z.string().optional(),
        parentId: z.string().min(1).optional(),
        isGroup: z.boolean().optional(),
      })
      .strict(),
    output: z.object({
      list: z.array(Tag).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'tags.get',
    description:
      'Reads one tag by _id. Returns null when no tag has that _id. Read-only.',
    kind: 'read',
    field: 'tagDetail',
    args: { _id: 'String!' },
    notFound: 'Tag not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Tag.nullable(),
  },
  {
    name: 'tags.create',
    description:
      'Creates a tag and returns it. Pass type such as core:customer to make a tag for one content type, or leave it out for a workspace tag. Names must be unique within a type. isGroup makes a group that other tags can sit under through parentId. Needs the tags create permission.',
    kind: 'write',
    field: 'tagsAdd',
    args: {
      name: 'String!',
      type: 'String',
      colorCode: 'String',
      parentId: 'String',
      isGroup: 'Boolean',
      description: 'String',
    },
    input: z
      .object({
        name: z.string().min(1),
        type: contentType.optional(),
        colorCode: z.string().optional(),
        parentId: z.string().min(1).optional(),
        isGroup: z.boolean().optional(),
        description: z.string().optional(),
      })
      .strict(),
    output: Tag,
  },
  {
    name: 'tags.edit',
    description:
      'Updates one tag and returns it. name is required and must stay unique within the tag type. Turning a group into a non-group clears parentId on its children. Fails when no tag has that _id. Needs the tags update permission.',
    kind: 'write',
    field: 'tagsEdit',
    args: {
      _id: 'String!',
      name: 'String',
      colorCode: 'String',
      parentId: 'String',
      isGroup: 'Boolean',
      description: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().min(1),
        colorCode: z.string().optional(),
        parentId: z.string().min(1).optional(),
        isGroup: z.boolean().optional(),
        description: z.string().optional(),
      })
      .strict(),
    output: Tag,
  },
  {
    name: 'tags.remove',
    description:
      'Permanently deletes one tag. Its child tags stay and lose their parent. Destructive. Needs the tags delete permission.',
    kind: 'destructive',
    field: 'tagsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'tags.tag',
    description:
      'Sets the tags of each target record to exactly tagIds, replacing the tags it had. To add one tag, send the record existing tagIds plus the new one. type is plugin:module. Core types are customer, user, company, form, product, automation, and documents. Other plugins handle their own types. Needs the tags tag permission.',
    kind: 'write',
    field: 'tagsTag',
    args: {
      type: 'String!',
      targetIds: '[String!]!',
      tagIds: '[String!]!',
    },
    input: z
      .object({
        type: contentType,
        targetIds: z.array(z.string().min(1)).min(1),
        tagIds: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    output: z.unknown(),
  },
  {
    name: 'relations.list',
    description:
      'Lists the relations that link one record to records of relatedContentType. contentType and relatedContentType are plugin:module such as core:customer or core:company. Each relation holds its two entities. Read-only.',
    kind: 'read',
    field: 'getRelationsByEntity',
    args: {
      contentType: 'String!',
      contentId: 'String!',
      relatedContentType: 'String!',
    },
    input: z
      .object({
        contentType,
        contentId: z.string().min(1),
        relatedContentType: contentType,
      })
      .strict(),
    output: z.array(Relation),
  },
  {
    name: 'relations.create',
    description:
      'Links two records with a new relation and returns it. entities must hold exactly two records, each as contentType and contentId. The call does not check for an existing identical link. Write.',
    kind: 'write',
    field: 'createRelation',
    args: { relation: 'RelationInput!' },
    input: z
      .object({
        relation: z
          .object({
            entities: z
              .array(
                z
                  .object({
                    contentType,
                    contentId: z.string().min(1),
                  })
                  .strict(),
              )
              .length(2),
          })
          .strict(),
      })
      .strict(),
    output: Relation,
  },
  {
    name: 'relations.manage',
    description:
      'Makes the records of relatedContentType linked to one record exactly relatedContentIds. Links to ids missing from the list are deleted, and new ids are linked. Pass [] to unlink them all. Returns the relations that remain. Destructive.',
    kind: 'destructive',
    field: 'manageRelations',
    args: {
      contentType: 'String!',
      contentId: 'String!',
      relatedContentType: 'String!',
      relatedContentIds: '[String]',
    },
    input: z
      .object({
        contentType,
        contentId: z.string().min(1),
        relatedContentType: contentType,
        relatedContentIds: z.array(z.string().min(1)),
      })
      .strict(),
    output: z.array(Relation),
  },
  {
    name: 'conformities.create',
    description:
      'Links mainType and mainTypeId to relType and relTypeId in the conformity store and returns the link. Returns the existing link when the pair is already linked. Write.',
    kind: 'write',
    field: 'conformityAdd',
    args: {
      mainType: 'String',
      mainTypeId: 'String',
      relType: 'String',
      relTypeId: 'String',
    },
    input: z
      .object({
        mainType: z.string().min(1),
        mainTypeId: z.string().min(1),
        relType: z.string().min(1),
        relTypeId: z.string().min(1),
      })
      .strict(),
    output: Conformity,
  },
]);

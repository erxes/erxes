import * as z from 'zod';
import { defineContract } from './define';

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const PostStatus = z.enum(['draft', 'published', 'scheduled', 'archived']);
const CategoryStatus = z.enum(['active', 'inactive']);

const cursorArgs = { limit: 'Int', cursor: 'String' };
const cursorInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const WebSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  domain: z.string().nullable(),
  templateType: z.string().nullable(),
  lastDeploymentUrl: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const CmsSiteSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  domain: z.string().nullable(),
  language: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  postUrlField: z.string().nullable(),
  postUrlPrefix: z.string().nullable(),
  accessPolicy: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const PostSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  type: z.string().nullable(),
  title: z.string().nullable(),
  slug: z.string().nullable(),
  excerpt: z.string().nullable(),
  status: z.string().nullable(),
  featured: z.boolean().nullable(),
  categoryIds: z.array(z.string()).nullable(),
  tagIds: z.array(z.string()).nullable(),
  authorId: z.string().nullable(),
  viewCount: z.number().nullable(),
  publishedDate: z.string().nullable(),
  scheduledDate: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const PostDetail = PostSummary.extend({
  content: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});

// Shared by create and edit. Create adds the required clientPortalId.
// A custom post type entry sets type to that type's _id, while the list
// filter takes the type's code. See the posts.list description.
const postFields = {
  language: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: PostStatus.optional(),
  scheduledDate: z.string().optional(),
  publishedDate: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

const postCreate = z
  .object({ clientPortalId: z.string().min(1), ...postFields })
  .strict();

const postEdit = z.object(postFields).strict();

const PageSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  parentId: z.string().nullable(),
  description: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const PageDetail = PageSummary.extend({
  content: z.string().nullable(),
});

const pageFields = {
  language: z.string().optional(),
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
};

const pageCreate = z
  .object({
    clientPortalId: z.string().min(1),
    ...pageFields,
    name: z.string().min(1),
  })
  .strict();

const pageEdit = z.object(pageFields).strict();

const CategorySummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const categoryFields = {
  language: z.string().optional(),
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: CategoryStatus.optional(),
};

const categoryCreate = z
  .object({
    clientPortalId: z.string().min(1),
    ...categoryFields,
    name: z.string().min(1),
  })
  .strict();

const categoryEdit = z.object(categoryFields).strict();

const TagSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  colorCode: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const tagFields = {
  language: z.string().optional(),
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  colorCode: z.string().optional(),
};

const tagCreate = z
  .object({
    clientPortalId: z.string().min(1),
    ...tagFields,
    name: z.string().min(1),
  })
  .strict();

const tagEdit = z.object(tagFields).strict();

const MenuSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  parentId: z.string().nullable(),
  webId: z.string().nullable(),
  label: z.string().nullable(),
  kind: z.string().nullable(),
  url: z.string().nullable(),
  icon: z.string().nullable(),
  order: z.number().nullable(),
  openInNewTab: z.boolean().nullable(),
  target: z.string().nullable(),
});

const menuFields = {
  language: z.string().optional(),
  parentId: z.string().optional(),
  webId: z.string().optional(),
  label: z.string().min(1).optional(),
  kind: z.string().min(1).optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  openInNewTab: z.boolean().optional(),
  target: z.string().optional(),
};

// The resolver assigns order when it is omitted.
const menuCreate = z
  .object({
    clientPortalId: z.string().min(1),
    ...menuFields,
    label: z.string().min(1),
    kind: z.string().min(1),
  })
  .strict();

const menuEdit = z.object(menuFields).strict();

const CustomPostTypeSummary = z.object({
  _id: z.string(),
  clientPortalId: z.string(),
  code: z.string(),
  label: z.string(),
  pluralLabel: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().nullable(),
});

// The GraphQL input requires label, pluralLabel and code on edit too.
const customPostTypeFields = {
  label: z.string().min(1),
  pluralLabel: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
};

const customPostTypeCreate = z
  .object({ clientPortalId: z.string().min(1), ...customPostTypeFields })
  .strict();

const customPostTypeEdit = z.object(customPostTypeFields).strict();

export const contentContract = defineContract('content', 1, [
  {
    name: 'websites.list',
    description:
      'Lists the websites in this workspace, one summary per website. Read-only.',
    kind: 'read',
    field: 'getWebList',
    args: {},
    input: z.object({}).strict(),
    output: z.array(WebSummary),
  },
  {
    name: 'websites.get',
    description:
      'Reads one website by _id. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'getWebDetail',
    args: { _id: 'String!' },
    notFound: 'Web not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: WebSummary.nullable(),
  },
  {
    name: 'cmsSites.list',
    description:
      'Lists the CMS site configs. Each site is one clientPortalId, which the posts, pages, categories, tags, menus and custom post type calls take to pick a site. Read-only.',
    kind: 'read',
    field: 'contentCMSList',
    args: {},
    input: z.object({}).strict(),
    output: z.array(CmsSiteSummary),
  },
  {
    name: 'cmsSites.get',
    description:
      'Reads one CMS site config by _id. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'contentCMS',
    args: { id: 'String!' },
    input: z.object({ id: z.string().min(1) }).strict(),
    output: CmsSiteSummary.nullable(),
  },
  {
    name: 'posts.list',
    description:
      'Lists posts of one CMS site, filtered by the optional status, searchValue, categoryIds, tagIds and type. type is "post" for blog posts, a custom post type code for that type\'s entries, or omitted for all. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'cmsPostList',
    args: {
      clientPortalId: 'String',
      language: 'String',
      type: 'String',
      status: 'PostStatus',
      searchValue: 'String',
      categoryIds: '[String]',
      tagIds: '[String]',
      ...cursorArgs,
    },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        language: z.string().optional(),
        type: z.string().optional(),
        status: PostStatus.optional(),
        searchValue: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
        tagIds: z.array(z.string()).optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      posts: z.array(PostSummary).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'posts.get',
    description:
      'Reads one post by _id, with its content. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsPost',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PostDetail.nullable(),
  },
  {
    name: 'posts.create',
    description:
      'Creates a post in clientPortalId. Set type to "post" for a blog post, or to a custom post type _id to create an entry of that type. title and clientPortalId are required. The slug is made unique from the slug or title. A user who can create but not publish always gets a draft, whatever status is passed.',
    kind: 'write',
    field: 'cmsPostsAdd',
    args: { input: 'PostInput!' },
    input: z.object({ input: postCreate }).strict(),
    output: PostDetail,
  },
  {
    name: 'posts.edit',
    description:
      'Edits a post by _id. Pass only the fields to change. Setting status to published needs approval rights.',
    kind: 'write',
    field: 'cmsPostsEdit',
    args: { _id: 'String!', input: 'PostInput!' },
    input: z.object({ _id: z.string().min(1), input: postEdit }).strict(),
    output: PostDetail,
  },
  {
    name: 'posts.changeStatus',
    description:
      'Sets a post to draft, published, scheduled or archived. Use it to publish or unpublish a post without a full edit. Returns the updated post.',
    kind: 'write',
    field: 'cmsPostsChangeStatus',
    args: { _id: 'String!', status: 'PostStatus!' },
    input: z.object({ _id: z.string().min(1), status: PostStatus }).strict(),
    output: PostSummary,
  },
  {
    name: 'posts.remove',
    description: 'Deletes one post by _id and its translations. Permanent.',
    kind: 'destructive',
    field: 'cmsPostsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'pages.list',
    description:
      'Lists the pages of one CMS site (clientPortalId), filtered by the optional searchValue. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'cmsPageList',
    args: {
      clientPortalId: 'String',
      language: 'String',
      searchValue: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        language: z.string().optional(),
        searchValue: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      pages: z.array(PageSummary).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'pages.get',
    description:
      'Reads one page by _id, with its content. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsPage',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: PageDetail.nullable(),
  },
  {
    name: 'pages.create',
    description:
      'Creates a page in clientPortalId. name and clientPortalId are required. The slug is made unique from the slug or name.',
    kind: 'write',
    field: 'cmsPagesAdd',
    args: { input: 'PageInput!' },
    input: z.object({ input: pageCreate }).strict(),
    output: PageDetail,
  },
  {
    name: 'pages.edit',
    description: 'Edits a page by _id. Pass only the fields to change.',
    kind: 'write',
    field: 'cmsPagesEdit',
    args: { _id: 'String!', input: 'PageInput!' },
    input: z.object({ _id: z.string().min(1), input: pageEdit }).strict(),
    output: PageDetail,
  },
  {
    name: 'pages.remove',
    description: 'Deletes one page by _id and its translations. Permanent.',
    kind: 'destructive',
    field: 'cmsPagesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'categories.list',
    description:
      'Lists the post categories of one CMS site (clientPortalId), filtered by the optional searchValue and status. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'cmsCategories',
    args: {
      clientPortalId: 'String',
      language: 'String',
      searchValue: 'String',
      status: 'CategoryStatus',
      ...cursorArgs,
    },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        language: z.string().optional(),
        searchValue: z.string().optional(),
        status: CategoryStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      list: z.array(CategorySummary).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'categories.get',
    description:
      'Reads one post category by _id. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsCategory',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: CategorySummary.nullable(),
  },
  {
    name: 'categories.create',
    description:
      'Creates a post category in clientPortalId. name and clientPortalId are required. status is active or inactive.',
    kind: 'write',
    field: 'cmsCategoriesAdd',
    args: { input: 'PostCategoryInput!' },
    input: z.object({ input: categoryCreate }).strict(),
    output: CategorySummary,
  },
  {
    name: 'categories.edit',
    description:
      'Edits a post category by _id. Pass only the fields to change.',
    kind: 'write',
    field: 'cmsCategoriesEdit',
    args: { _id: 'String!', input: 'PostCategoryInput!' },
    input: z.object({ _id: z.string().min(1), input: categoryEdit }).strict(),
    output: CategorySummary,
  },
  {
    name: 'categories.remove',
    description:
      'Deletes one post category by _id and its translations. Permanent.',
    kind: 'destructive',
    field: 'cmsCategoriesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'tags.list',
    description:
      'Lists the post tags of one CMS site (clientPortalId), filtered by the optional searchValue. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'cmsTags',
    args: {
      clientPortalId: 'String',
      language: 'String',
      searchValue: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        language: z.string().optional(),
        searchValue: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      tags: z.array(TagSummary).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'tags.get',
    description:
      'Reads one post tag by _id. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsTag',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TagSummary.nullable(),
  },
  {
    name: 'tags.create',
    description:
      'Creates a post tag in clientPortalId. name and clientPortalId are required.',
    kind: 'write',
    field: 'cmsTagsAdd',
    args: { input: 'PostTagInput!' },
    input: z.object({ input: tagCreate }).strict(),
    output: TagSummary,
  },
  {
    name: 'tags.edit',
    description: 'Edits a post tag by _id. Pass only the fields to change.',
    kind: 'write',
    field: 'cmsTagsEdit',
    args: { _id: 'String!', input: 'PostTagInput!' },
    input: z.object({ _id: z.string().min(1), input: tagEdit }).strict(),
    output: TagSummary,
  },
  {
    name: 'tags.remove',
    description: 'Deletes one post tag by _id and its translations. Permanent.',
    kind: 'destructive',
    field: 'cmsTagsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'menus.list',
    description:
      'Lists the menu items of one CMS site (clientPortalId), optionally one kind of menu. Returns at most 20 items with no paging. Read-only.',
    kind: 'read',
    field: 'cmsMenus',
    args: { clientPortalId: 'String!', kind: 'String' },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        kind: z.string().optional(),
      })
      .strict(),
    output: z.array(MenuSummary),
  },
  {
    name: 'menus.get',
    description:
      'Reads one menu item by _id within clientPortalId. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsMenu',
    args: { _id: 'String!', clientPortalId: 'String!' },
    input: z
      .object({
        _id: z.string().min(1),
        clientPortalId: z.string().min(1),
      })
      .strict(),
    output: MenuSummary.nullable(),
  },
  {
    name: 'menus.create',
    description:
      'Creates a menu item in clientPortalId. clientPortalId, label and kind are required. order is set to the end of the list when omitted.',
    kind: 'write',
    field: 'cmsAddMenu',
    args: { input: 'MenuItemInput!' },
    input: z.object({ input: menuCreate }).strict(),
    output: MenuSummary,
  },
  {
    name: 'menus.edit',
    description: 'Edits a menu item by _id. Pass only the fields to change.',
    kind: 'write',
    field: 'cmsEditMenu',
    args: { _id: 'String!', input: 'MenuItemInput!' },
    input: z.object({ _id: z.string().min(1), input: menuEdit }).strict(),
    output: MenuSummary,
  },
  {
    name: 'menus.remove',
    description:
      'Deletes one menu item by _id and its translations. Permanent.',
    kind: 'destructive',
    field: 'cmsRemoveMenu',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'customPostTypes.list',
    description:
      'Lists the custom post types of one CMS site (clientPortalId), filtered by the optional searchValue. Pages with a cursor: pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'cmsCustomPostTypeList',
    args: { clientPortalId: 'String', searchValue: 'String', ...cursorArgs },
    input: z
      .object({
        clientPortalId: z.string().min(1),
        searchValue: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: z.object({
      list: z.array(CustomPostTypeSummary).nullable(),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    }),
  },
  {
    name: 'customPostTypes.get',
    description:
      'Reads one custom post type by _id. Returns null when it does not exist. Read-only.',
    kind: 'read',
    field: 'cmsCustomPostType',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: CustomPostTypeSummary.nullable(),
  },
  {
    name: 'customPostTypes.create',
    description:
      'Creates a custom post type in clientPortalId. clientPortalId, label, pluralLabel and code are required. code is the unique identifier the posts.list type filter uses. System type codes are rejected.',
    kind: 'write',
    field: 'cmsCustomPostTypesAdd',
    args: { input: 'CustomPostTypeInput!' },
    input: z.object({ input: customPostTypeCreate }).strict(),
    output: CustomPostTypeSummary,
  },
  {
    name: 'customPostTypes.edit',
    description:
      'Edits a custom post type by _id. label, pluralLabel and code are required on every edit. System type codes are rejected.',
    kind: 'write',
    field: 'cmsCustomPostTypesEdit',
    args: { _id: 'String!', input: 'CustomPostTypeInput!' },
    input: z
      .object({ _id: z.string().min(1), input: customPostTypeEdit })
      .strict(),
    output: CustomPostTypeSummary,
  },
  {
    name: 'customPostTypes.remove',
    description: 'Deletes one custom post type by _id. Permanent.',
    kind: 'destructive',
    field: 'cmsCustomPostTypesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
]);

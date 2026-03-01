import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_OFFSET_PARAM_DEFS,
} from 'erxes-api-shared/utils';

export const types = `
    enum PostStatus {
        draft
        published
        scheduled
        archived
    }

    enum PostAuthorKind {
        user
        clientPortalUser
    }

    enum PostDateField {
        createdAt
        updatedAt
        scheduledDate
    }

    union Author = User 

    type Post @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String!
        type: String
        customPostType: CustomPostType
        authorKind: PostAuthorKind
        authorId: String
        author: Author
        clientPortalId: String!
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        status: PostStatus
        tagIds: [String]
        tags: [PostTag]
        featured: Boolean
        featuredDate: Date
        scheduledDate: Date
        publishedDate: Date
        autoArchiveDate: Date
        reactions: [String]
        reactionCounts: JSON
        thumbnail: Attachment
        images: [Attachment]
        video: Attachment
        audio: Attachment
        documents: [Attachment]
        attachments: [Attachment]
        pdfAttachment: PdfAttachment
        videoUrl: String
        createdAt: Date
        updatedAt: Date

        
        categories: [PostCategory]

        customFieldsData: JSON

        customFieldsMap: JSON
    }

    type PostList {
        posts: [Post]
        totalCount: Int
        pageInfo: PageInfo
    }

    type PostListPagination {
        posts: [Post]
        totalCount: Int
    }


    type Translation {
        _id: String!
        postId: String
        language: String
        title: String
        content: String
        excerpt: String
        customFieldsData: JSON
    }
`;

export const inputs = `
    input PostInput {
        clientPortalId: String
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        featured: Boolean
        status: PostStatus
        tagIds: [String]
        authorId: String
        scheduledDate: Date
        publishedDate: Date
        autoArchiveDate: Date
        reactions: [String]
        reactionCounts: JSON
        thumbnail: AttachmentInput
        images: [AttachmentInput]
        video: AttachmentInput
        audio: AttachmentInput
        documents: [AttachmentInput]
        attachments: [AttachmentInput]
        pdfAttachment: PdfAttachmentInput
        videoUrl: String
        customFieldsData: JSON
        type: String
    }

    input TranslationInput {
        postId: String
        language: String
        title: String
        content: String
        excerpt: String
        customFieldsData: JSON
        type: String
    }
`;

const commonPostQuerySelector = `
    ${GQL_CURSOR_PARAM_DEFS}
    featured: Boolean
    type: String
    categoryIds: [String]
    searchValue: String
    status: PostStatus
    tagIds: [String]
    sortField: String
    sortDirection: String
    language: String
    dateField: PostDateField
    dateFrom: Date
    dateTo: Date
`;

const commonPostQuerySelectorPagination = `
    ${GQL_OFFSET_PARAM_DEFS}
    featured: Boolean
    type: String
    categoryIds: [String]
    searchValue: String
    status: PostStatus
    tagIds: [String]
    language: String

`;

export const queries = `
    cmsPost(_id: String, slug: String, language: String): Post
    cmsPosts(clientPortalId: String, ${commonPostQuerySelector}): [Post]
    cmsPostList(clientPortalId: String, ${commonPostQuerySelector}): PostList
    cmsTranslations(postId: String): [Translation]

    cpPosts(language: String, ${commonPostQuerySelector}): [Post]
    cpPostList(language: String, ${commonPostQuerySelector}): PostList
    cpPost(_id: String, slug: String, language: String, clientPortalId: String): Post
    cpPostListWithPagination(language:String, ${commonPostQuerySelectorPagination}): PostListPagination
`;

export const mutations = `
    cmsPostsAdd(input: PostInput!): Post
    cmsPostsEdit(_id: String!, input: PostInput!): Post
    cmsPostsRemove(_id: String!): JSON
    cmsPostsRemoveMany(_ids: [String]!): JSON
    cmsPostsChangeStatus(_id: String!, status: PostStatus!): Post
    cmsPostsToggleFeatured(_id: String!): Post

    cpPostsIncrementViewCount(_id: String!): Post

    cmsAddTranslation(input: TranslationInput!): Translation
    cmsEditTranslation(input: TranslationInput!): Translation
`;

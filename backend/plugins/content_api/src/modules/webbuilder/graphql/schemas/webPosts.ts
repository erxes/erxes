import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    enum WebPostStatus {
        draft
        published
        scheduled
        archived
    }

    enum WebPostAuthorKind {
        user
        clientPortalUser
    }

    union WebAuthor = User 

    type WebPost @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String!
        webId: String!
        type: String
        customPostType: CustomPostType
        authorKind: WebPostAuthorKind
        authorId: String
        author: WebAuthor
        clientPortalId: String!
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        status: WebPostStatus
        tagIds: [String]
  
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

    type WebPostList {
        posts: [WebPost]
        totalCount: Int
        pageInfo: PageInfo
    }

    type WebTranslation {
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
    input WebPostInput {
        webId: String
        clientPortalId: String
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        featured: Boolean
        status: WebPostStatus
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

    input WebTranslationInput {
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
    status: WebPostStatus
    tagIds: [String]
    sortField: String
    sortDirection: String
    language: String
`;

export const queries = `
    cpWebPost(_id: String, slug: String, language: String, webId: String): WebPost
    cpWebPosts(webId: String!, language: String, ${commonPostQuerySelector}): [WebPost]
    cpWebPostList(webId: String!, language: String, ${commonPostQuerySelector}): WebPostList
    cpWebTranslations(postId: String): [WebTranslation]
`;

export const mutations = `
    cpWebPostsAdd(input: WebPostInput!): WebPost
    cpWebPostsEdit(_id: String!, input: WebPostInput!): WebPost
    cpWebPostsRemove(_id: String!): JSON
    cpWebPostsChangeStatus(_id: String!, status: WebPostStatus!): WebPost
    cpWebPostsToggleFeatured(_id: String!): WebPost

    cpWebAddTranslation(input: WebTranslationInput!): WebTranslation
    cpWebEditTranslation(input: WebTranslationInput!): WebTranslation
`;
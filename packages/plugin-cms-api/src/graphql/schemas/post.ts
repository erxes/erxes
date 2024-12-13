import {
    attachmentType,
    attachmentInput,
    pdfAttachmentType,
    pdfAttachmentInput
  } from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}
  ${pdfAttachmentType}
  ${pdfAttachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }


  extend type Tag @key(fields: "_id") {
    _id: String! @external
  }
    
    enum PostStatus {
        draft
        published
        scheduled
        archived
    }

    type Post {
        _id: String!
        clientPortalId: String
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        status: PostStatus
        tagIds: [String]
        authorId: String
        featured: Boolean
        featuredDate: Date
        scheduledDate: Date
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

        author: User
        categories: [PostCategory]
        tags: [Tag]
        customFieldsData: JSON
    }

    type PostList {
        posts: [Post]
        totalCount: Int
        totalPages: Int
        currentPage: Int
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
    }
`;

export const queries = `
    cmsPost(_id: String): Post
    cmsPosts(clientPortalId: String!, featured: Boolean, categoryId: String, searchValue: String, status: PostStatus, page: Int, perPage: Int, tagIds: [String], sortField: String, sortDirection: SortDirection): [Post]
    cmsPostList(clientPortalId: String!, featured: Boolean, categoryId: String, searchValue: String, status: PostStatus, page: Int, perPage: Int, tagIds: [String], sortField: String, sortDirection: SortDirection): PostList
`;

export const mutations = `
    cmsPostsAdd(input: PostInput!): Post
    cmsPostsEdit(_id: String!, input: PostInput!): Post
    cmsPostsRemove(_id: String!): JSON
    cmsPostsChangeStatus(_id: String!, status: PostStatus!): Post
    cmsPostsToggleFeatured(_id: String!): Post

    cmsPostsIncrementViewCount(_id: String!): Post
`;

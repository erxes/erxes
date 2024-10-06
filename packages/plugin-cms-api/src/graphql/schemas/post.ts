import {
    attachmentType,
    attachmentInput,
  } from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

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
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        status: PostStatus
        tagIds: [String]
        authorId: String
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
        createdAt: Date
        updatedAt: Date

        author: User
        categories: [PostCategory]
        tags: [Tag]
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
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        status: PostStatus
        tagIds: [String]
        authorId: String
        scheduledDate: Date
        autoArchiveDate: Date
        reactions: [String]
        reactionCounts: { [key: string]: number }
        thumbnail: Attachment
        images: [Attachment]
        video: Attachment
        audio: Attachment
        documents: [Attachment]
        attachments: [Attachment]
    }
`;

export const queries = `
    post(_id: String): Post
    posts(categoryId: String, searchValue: String, status: PostStatus, page: Int, perPage: Int, tagIds: [String], sortField: String, sortDirection: SortDirection): [Post]
    postList(categoryId: String, searchValue: String, status: PostStatus, page: Int, perPage: Int, tagIds: [String], sortField: String, sortDirection: SortDirection): PostList
`;

export const mutations = `
    postsAdd(input: PostInput!): Post
    postsEdit(_id: String!, input: PostInput!): Post
    postsDelete(_id: String!): Post
    postsChangeStatus(_id: String!, status: PostStatus!): Post

    postsIncrementViewCount(_id: String!): Post
`;

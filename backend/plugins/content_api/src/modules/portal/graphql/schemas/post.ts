import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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

    union Author = User | ClientPortalUser

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

        
        categories: [PostCategory]
        tags: [PostTag]
        customFieldsData: JSON

        customFieldsMap: JSON
    }

    type PostList {
        posts: [Post]
        totalCount: Int
        pageInfo: PageInfo
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

export const queries = `
    cmsPost(_id: String, slug: String, language: String): Post
    cmsPosts(clientPortalId: String, featured: Boolean,type: String, categoryId: String, searchValue: String, status: PostStatus, tagIds: [String], sortField: String, sortDirection: String, language: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [Post]
    cmsPostList(clientPortalId: String, featured: Boolean, type: String, categoryId: String, searchValue: String, status: PostStatus, tagIds: [String], sortField: String, sortDirection: String, language: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): PostList
    cmsTranslations(postId: String): [Translation]
`;

export const mutations = `
    cmsPostsAdd(input: PostInput!): Post
    cmsPostsEdit(_id: String!, input: PostInput!): Post
    cmsPostsRemove(_id: String!): JSON
    cmsPostsChangeStatus(_id: String!, status: PostStatus!): Post
    cmsPostsToggleFeatured(_id: String!): Post

    cmsPostsIncrementViewCount(_id: String!): Post

    cmsAddTranslation(input: TranslationInput!): Translation
    cmsEditTranslation(input: TranslationInput!): Translation
`;

import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type PageItem {
        _id: String!
        name: String
        type: String
        content: String
        order: Int
        objectType: String
        objectId: String
        config: JSON
    }

    type Page {
        _id: String!
        clientPortalId: String!
        name: String
        parentId: String
        description: String
        coverImage: String
        type: String
        slug: String
        content: String
        status: String
        createdUserId: String
        createdUser: User
        createdAt: Date
        updatedAt: Date
        pageItems: [PageItem]
        customFieldsData: JSON
        customFieldsMap: JSON
        thumbnail: Attachment
        pageImages: [Attachment]
        video: Attachment
        audio: Attachment
        documents: [Attachment]
        attachments: [Attachment]
        pdfAttachment: PdfAttachment
        videoUrl: String
        translations: [Translation]
    }

    type PageList {
        pages: [Page]
        totalCount: Int
        pageInfo: PageInfo
    }
`;

export const inputs = `
    input PageItemInput {
        name: String
        type: String
        content: String
        order: Int
        objectType: String
        objectId: String
        config: JSON
    }

    input PageInput {
        clientPortalId: String
        language: String
        name: String
        parentId: String
        description: String
        coverImage: String
        status: String
        type: String
        slug: String
        content: String
        thumbnail: AttachmentInput
        pageImages: [AttachmentInput]
        video: AttachmentInput
        audio: AttachmentInput
        documents: [AttachmentInput]
        attachments: [AttachmentInput]
        pdfAttachment: PdfAttachmentInput
        videoUrl: String
        pageItems: [PageItemInput]
        customFieldsData: JSON
        translations: [TranslationInput]
    }
`;

export const queries = `
    cmsPage(_id: String, slug: String, language: String, clientPortalId: String): Page
    cmsPages(clientPortalId: String, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [Page]
    cmsPageList(clientPortalId: String, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): PageList

    cpPages(language: String): [Page]
    cpPageList(language: String, ${GQL_CURSOR_PARAM_DEFS}): PageList
`;

export const mutations = `
    cmsPagesAdd(input: PageInput!): Page
    cmsPagesEdit(_id: String!, input: PageInput!): Page
    cmsPagesRemove(_id: String!): JSON
    cpCmsPagesAdd(input: PageInput!): Page
`;

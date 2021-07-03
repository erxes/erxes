export const types = `
    type Forum {
        _id: String!
        title: String
        description: String
        languageCode: String
        createdBy: String
        createdDate: Date
        modifiedBy: String
        modifiedDate: Date
        brand: Brand
        topics: [ForumTopic]
    }

    type ForumTopic {
        _id: String!
        title: String
        description: String
        forumId: String
        createdBy: String
        createdDate: Date
        modifiedBy: String
        modifiedDate: Date
        discussionIds: [String]
        forum: Forum

        discussions: [ForumDiscussion]
    }

    type ForumDiscussion{
        _id: String!
        title: String
        description: String
        topicId: String
        forumId: String
        tagIds: [String]
        createdBy: String
        createdUser: User
        createdDate: Date
        modifiedBy: String
        modifiedDate: Date
        comments: [ForumDiscussionComment]
        content: String!
        status: String
        startDate: Date
        closeDate: Date
        isComplete: Boolean
        getTags: [Tag]

        attachments: [JSON]
        createdCustomer: Customer

    }


    type ForumDiscussionComment{
        _id: String!
        title: String
        content: String
        discussionId: String
        createdUser: User
        createdDate: Date
        createdCustomer: Customer

        currentCustomerReaction: String
        reactionTotalCount: Int
    }
`;

export const queries = `
    forums(page: Int perPage: Int): [Forum]
    forumDetail(_id: String!): Forum
    forumsTotalCount: Int

    forumTopics(page: Int perPage: Int forumId: String!): [ForumTopic]
    forumTopicDetail(_id: String!): ForumTopic
    forumTopicsTotalCount(forumId: String!):Int
    forumTopicsGetLast: ForumTopic

    forumDiscussions(page: Int perPage: Int topicId: String!): [ForumDiscussion]
    forumDiscussionDetail(_id: String!): ForumDiscussion
    forumDiscussionsTotalCount(topicId: String!): Int

    discussionComments(discussionId: String!): [ForumDiscussionComment]
    discussionCommentsTotalCount(discussionId: String!): Int
`;

const forumMutationParams = `
    title: String
    description: String
    languageCode: String
    brandId: String!
`;

const topicMutationParams = `
    title: String
    description: String
    forumId: String
    discussionIds: [String]
`;

const discussionMutationParams = `
    title: String
    description: String
    topicId: String!
    forumId: String!
    content: String!
    status: String
    startDate: Date
    closeDate: Date
    isComplete: Boolean
    tagIds: [String]

    attachments: [JSON]
`;

const commentMutationParams = `
    title: String
    content: String
    discussionId: String!
`;

export const mutations = `
    forumsAdd(${forumMutationParams}): Forum
    forumsEdit(_id: String! ${forumMutationParams}): Forum
    forumsRemove(_id: String!): JSON

    forumTopicsAdd(${topicMutationParams}): ForumTopic
    forumTopicsEdit(_id: String! ${topicMutationParams}): ForumTopic
    forumTopicsRemove(_id: String!): JSON

    forumDiscussionsAdd(${discussionMutationParams}): ForumDiscussion
    forumDiscussionsEdit(_id: String! ${discussionMutationParams}): ForumDiscussion
    forumDiscussionsRemove(_id: String!): JSON 

    discussionCommentsAdd(${commentMutationParams}): ForumDiscussionComment
    discussionCommentsEdit(_id: String ${commentMutationParams}): ForumDiscussionComment
    discussionCommentsRemove(_id: String): JSON

    forumReactionsToggle(type: String! contentTypeId: String! contentType: String! ): JSON
`;

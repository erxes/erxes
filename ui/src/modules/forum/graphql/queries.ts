const forums = `
    query forums{
        forums{
            _id
            title
            description
        }
    }
`;

const forumDetail = `
    query forumDetail($_id: String!){
        forumDetail(_id: $_id){
            _id
            title
            description
        }
    }
`;

const forumsTotalCount = `
    query forumsTotalCount{
        forumsTotalCount
    }
`;

const forumTopics = `
    query forumTopics{
        forumTopics{
            _id
            title
            description
        }
    }
`;

const forumTopicDetail = `
    query forumTopicDetail($_id: String!){
        forumTopicDetail(_id: $_id){
            _id
            title
            description
        }
    }
`;

const forumTopicTotalCount = `
    query forumTopicTotalCount{
        forumTopicTotalCount
    }
`;

const forumDiscussions = `
    query forumDiscussions{
        forumDiscussions{
            _id
            title
            description
        }
    }
`;

const forumDiscussionDetail = `
    query forumDiscussionDetail($_id: String!){
        forumDiscussionDetail(_id: $_id){
            _id
            title
            description
        }
    }
`;

const forumDiscussionsTotalCount = `
    query forumDiscussionsTotalCount{
        forumDiscussionsTotalCount
    }
`;

export default {
  forums,
  forumDetail,
  forumsTotalCount,
  forumTopics,
  forumTopicDetail,
  forumTopicTotalCount,
  forumDiscussions,
  forumDiscussionDetail,
  forumDiscussionsTotalCount
};

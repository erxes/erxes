const topicFields = `
    _id
    title
    description
    forumId
`;

const discussionFields = `
    _id
    title
    description
`;

const forums = `
    query forums{
        forums{
            _id
            title
            description
            
            topics{
                ${topicFields}
            }
        }
    }
`;

const forumDetail = `
    query forumDetail($_id: String!){
        forumDetail(_id: $_id){
            _id
            title
            description
            
            topics{
                ${topicFields}
            }
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
            forumId

            discussions{
                ${discussionFields}
            }
        }
    }
`;

const forumTopicDetail = `
    query forumTopicDetail($_id: String!){
        forumTopicDetail(_id: $_id){
            _id
            title
            description
            forumId

            discussions{
                ${discussionFields}
            }
        }
    }
`;

const forumTopicTotalCount = `
    query forumTopicTotalCount($forumId: String){
        forumTopicTotalCount(forumId: $forumId)
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

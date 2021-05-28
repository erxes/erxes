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
            languageCode
            
            createdBy
            createdDate
            modifiedBy
            modifiedDate

            topics{
                ${topicFields}
            }
            brand{
                _id
                name
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
    query forumTopics($forumId: String!){
        forumTopics(forumId: $forumId){
            _id
            title
            description
            forumId

            createdBy
            createdDate
            modifiedBy
            modifiedDate

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

const forumTopicsTotalCount = `
    query forumTopicsTotalCount($forumId: String){
        forumTopicsTotalCount(forumId: $forumId)
    }
`;

const forumTopicsGetLast = `
    query forumTopicsGetLast{
        forumTopicsGetLast{
            _id
        }
    }
`;

const forumDiscussions = `
    query forumDiscussions($page: Int $perPage: Int $topicId: String!){
        forumDiscussions(page: $page perPage: $perPage topicId: $topicId){
            _id
            title
            description
            createdBy
            createdDate
            modifiedBy
            modifiedDate
            createdUser {
                _id
                username
                email
                details {
                  avatar
                  fullName
                }
              }
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
    query forumDiscussionsTotalCount($topicId: String!){
        forumDiscussionsTotalCount(topicId: $topicId)
    }
`;

export default {
  forums,
  forumDetail,
  forumsTotalCount,
  forumTopics,
  forumTopicDetail,
  forumTopicsTotalCount,
  forumTopicsGetLast,
  forumDiscussions,
  forumDiscussionDetail,
  forumDiscussionsTotalCount
};

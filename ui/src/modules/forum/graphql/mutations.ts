const forumParamsDef = `
    $title: String
    $description: String
    $brandId: String!
`;

const forumParamVal = `
    title: $title
    description: $description
    brandId: $brandId
`;

const forumTopicParamsDef = `
    $title: String
    $description: String
    $forumId: String
`;

const forumTopicParamVal = `
    title: $title
    description: $description
    forumId: $forumId
`;

const forumDiscussionParamsDef = `
    $title: String
    $description: String
    $topicId: String!
    $forumId: String!
    $content: String!
    $status: String
    $startDate: Date
    $closeDate: Date
    $isComplete: Boolean
    $tagIds: [String]
    $attachments: [JSON]
`;

const forumDiscussionParamsVal = `
    title: $title
    description: $description
    topicId: $topicId
    forumId: $forumId
    content: $content
    status: $status
    startDate: $startDate
    closeDate: $closeDate
    isComplete: $isComplete
    tagIds: $tagIds
    attachments: $attachments
`;

const forumsAdd = `
    mutation forumsAdd(${forumParamsDef}){
        forumsAdd(${forumParamVal}){
            _id
            title
            description
        }
    }
`;

const forumsEdit = `
    mutation forumsEdit($_id: String! ${forumParamsDef}){
        forumsEdit(_id: $_id ${forumParamVal}){
            _id
            title
            description
        }
    }
`;

const forumsRemove = `
    mutation forumsRemove($_id: String!){
        forumsRemove(_id: $_id)
    }
`;

const forumTopicsAdd = `
    mutation forumTopicsAdd(${forumTopicParamsDef}){
        forumTopicsAdd(${forumTopicParamVal}){
            _id
        }
    }
`;

const forumTopicsEdit = `
    mutation forumTopicsEdit($_id: String! ${forumTopicParamsDef}){
        forumTopicsEdit(_id: $_id ${forumTopicParamVal}){
            _id
        }
    }
`;

const forumTopicsRemove = `
    mutation forumTopicsRemove($_id: String!){
        forumTopicsRemove(_id: $_id)
    }
`;

const forumDiscussionsAdd = `
    mutation forumDiscussionsAdd(${forumDiscussionParamsDef}){
        forumDiscussionsAdd(${forumDiscussionParamsVal}){
            _id
        }
    }
`;

const forumDiscussionsEdit = `
    mutation forumDiscussionsEdit($_id: String! ${forumDiscussionParamsDef}){
        forumDiscussionsEdit(_id: $_id ${forumDiscussionParamsVal}){
            _id
        }
    }
`;

const forumDiscussionsRemove = `
    mutation forumDiscussionsRemove($_id: String!){
        forumDiscussionsRemove(_id: $_id)
    }
`;

export default {
  forumsAdd,
  forumsEdit,
  forumsRemove,
  forumTopicsAdd,
  forumTopicsEdit,
  forumTopicsRemove,
  forumDiscussionsAdd,
  forumDiscussionsEdit,
  forumDiscussionsRemove
};

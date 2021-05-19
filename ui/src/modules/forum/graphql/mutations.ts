const forumParamsDef = `
    $title: String
    $description: String
`;

const forumParamsVal = `
    title: $title
    description: $description
`;

const forumTopicParamsDef = `
    $title: String
    $description: String
`;

const forumTopicParamsVal = `
    title: $title
    description: $description
`;

const forumDiscussionParamsDef = `
    $title: String
    $description: String
`;

const forumDiscussionParamsVal = `
    title: $title
    description: $description
`;

const forumsAdd = `
    mutation forumsAdd(${forumParamsDef}){
        forumsAdd(${forumParamsVal}){
            _id
            title
            description
        }
    }
`;

const forumsEdit = `
    mutation forumsEdit($_id: String! ${forumParamsDef}){
        forumsEdit(_id: $_id ${forumParamsVal}){
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
        forumTopicsAdd(${forumTopicParamsVal}){
            _id
        }
    }
`;

const forumTopicsEdit = `
    mutation forumTopicsEdit($_id: String! ${forumTopicParamsDef}){
        forumTopicsEdit(_id: $_id ${forumTopicParamsVal}){
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

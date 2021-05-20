const forumParamsDef = `$doc: ForumDoc!`;
const forumTopicParamsDef = `$doc: KnowledgeBaseCategoryDoc!`;
const forumDiscussionParamsDef = `$doc: KnowledgeBaseArticleDoc!`;

const commonParams = `doc: $doc`;

const forumsAdd = `
    mutation forumsAdd(${forumParamsDef}){
        forumsAdd(${commonParams}){
            _id
            title
            description
        }
    }
`;

const forumsEdit = `
    mutation forumsEdit($_id: String! ${forumParamsDef}){
        forumsEdit(_id: $_id ${commonParams}){
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
        forumTopicsAdd(${commonParams}){
            _id
        }
    }
`;

const forumTopicsEdit = `
    mutation forumTopicsEdit($_id: String! ${forumTopicParamsDef}){
        forumTopicsEdit(_id: $_id ${commonParams}){
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
        forumDiscussionsAdd(${commonParams}){
            _id
        }
    }
`;

const forumDiscussionsEdit = `
    mutation forumDiscussionsEdit($_id: String! ${forumDiscussionParamsDef}){
        forumDiscussionsEdit(_id: $_id ${commonParams}){
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

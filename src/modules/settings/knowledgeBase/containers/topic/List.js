import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../../utils';
import { TopicList } from '../../components';

const commonParamsDef = `$doc: KnowledgeBaseTopicDoc!`;
// $title: String!,
// $description: String,
// $categoryIds: [String],
// $brandId: String!

const commonParams = `
  doc: $doc
`;
// title: $title,
// description: $description,
// categoryIds: $categoryIds,
// brandId: $brandId

export default commonListComposer({
  name: 'knowledgeBaseTopics',

  gqlAddMutation: graphql(
    gql`
    mutation knowledgeBaseTopicsAdd(${commonParamsDef}) {
      knowledgeBaseTopicsAdd(${commonParams}) {
        _id
      }
    }
    `,
    {
      name: 'addMutation'
    }
  ),

  gqlEditMutation: graphql(
    gql`
      mutation knowledgeBaseTopicsEdit($_id: String!, ${commonParamsDef}) {
        knowledgeBaseTopicsEdit(_id: $_id, ${commonParams}) {
          _id
        }
      }
    `,
    {
      name: 'editMutation'
    }
  ),

  gqlRemoveMutation: graphql(
    gql`
      mutation knowledgeBaseTopicsRemove($_id: String!) {
        knowledgeBaseTopicsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  gqlListQuery: graphql(
    gql`
      query knowledgeBaseTopics($limit: Int!) {
        knowledgeBaseTopics(limit: $limit) {
          _id
          title
          description
          brand {
            _id
            name
          }
          categories {
            _id
            title
          }
          createdBy
          createdDate
          modifiedBy
          modifiedDate
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            limit: queryParams.limit || 20
          }
        };
      }
    }
  ),
  gqlTotalCountQuery: graphql(
    gql`
      query totalKnowledgeBaseTopicsCount {
        knowledgeBaseTopicsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),
  ListComponent: TopicList
});

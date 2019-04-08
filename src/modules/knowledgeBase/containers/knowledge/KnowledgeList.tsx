import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { KnowledgeList } from '../../components';
import { mutations, queries } from '../../graphql';
import {
  AddTopicsMutationResponse,
  EditTopicsMutationResponse,
  RemoveTopicsMutation,
  TopicsQueryResponse,
  TopicsTotalCountQueryResponse,
  TopicVariables
} from '../../types';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  articlesCount: number;
};

type FinalProps = {
  topicsQuery: TopicsQueryResponse;
  topicsCountQuery: TopicsTotalCountQueryResponse;
} & Props &
  AddTopicsMutationResponse &
  EditTopicsMutationResponse &
  RemoveTopicsMutation;

const KnowledgeBaseContainer = (props: FinalProps) => {
  const {
    currentCategoryId,
    topicsQuery,
    topicsCountQuery,
    removeTopicsMutation,
    addTopicsMutation,
    editTopicsMutation,
    queryParams,
    articlesCount
  } = props;

  // remove action
  const remove = topicId => {
    confirm().then(() => {
      removeTopicsMutation({
        variables: { _id: topicId }
      })
        .then(() => {
          topicsQuery.refetch();
          topicsCountQuery.refetch();

          Alert.success('You successfully deleted a knowledge base');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, object) => {
    let mutation = addTopicsMutation;

    // if edit mode
    if (object) {
      mutation = editTopicsMutation;
      doc._id = object._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        // update queries
        topicsQuery.refetch();
        topicsCountQuery.refetch();

        Alert.success(
          `You successfully ${object ? 'updated' : 'added'} a knowledge base`
        );

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    remove,
    save,
    currentCategoryId,
    queryParams,
    articlesCount,
    topics: topicsQuery.knowledgeBaseTopics || [],
    loading: topicsQuery.loading,
    refetch: topicsQuery.refetch,
    topicsCount: topicsCountQuery.knowledgeBaseTopicsTotalCount || 0
  };

  return <KnowledgeList {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TopicsQueryResponse>(gql(queries.knowledgeBaseTopics), {
      name: 'topicsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TopicsTotalCountQueryResponse>(
      gql(queries.knowledgeBaseTopicsTotalCount),
      {
        name: 'topicsCountQuery'
      }
    ),
    graphql<Props, EditTopicsMutationResponse, TopicVariables>(
      gql(mutations.knowledgeBaseTopicsEdit),
      {
        name: 'editTopicsMutation'
      }
    ),
    graphql<Props, AddTopicsMutationResponse, TopicVariables>(
      gql(mutations.knowledgeBaseTopicsAdd),
      {
        name: 'addTopicsMutation'
      }
    ),
    graphql<Props, RemoveTopicsMutation, { _id: string }>(
      gql(mutations.knowledgeBaseTopicsRemove),
      {
        name: 'removeTopicsMutation',
        options: ({ currentCategoryId }) => {
          return {
            refetchQueries: !currentCategoryId
              ? []
              : [
                  {
                    query: gql(queries.knowledgeBaseArticlesTotalCount),
                    variables: { categoryIds: [currentCategoryId] }
                  },
                  {
                    query: gql(queries.knowledgeBaseCategoryDetail),
                    variables: { _id: currentCategoryId }
                  }
                ]
          };
        }
      }
    )
  )(KnowledgeBaseContainer)
);

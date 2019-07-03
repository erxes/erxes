import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { KnowledgeList } from '../../components';
import { mutations, queries } from '../../graphql';
import {
  RemoveTopicsMutation,
  TopicsQueryResponse,
  TopicsTotalCountQueryResponse
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
  RemoveTopicsMutation;

const KnowledgeBaseContainer = (props: FinalProps) => {
  const {
    currentCategoryId,
    topicsQuery,
    topicsCountQuery,
    removeTopicsMutation,
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

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      topicsQuery.refetch();
      topicsCountQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={
          object
            ? mutations.knowledgeBaseTopicsEdit
            : mutations.knowledgeBaseTopicsAdd
        }
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const extendedProps = {
    ...props,
    remove,
    renderButton,
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

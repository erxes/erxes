import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import KnowledgeList from '../../components/knowledge/KnowledgeList';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';
import {
  RemoveTopicsMutation,
  TopicsQueryResponse,
  TopicsTotalCountQueryResponse,
} from '@erxes/ui-knowledgebase/src/types';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  articlesCount: number;
};

const KnowledgeBaseContainer = (props: Props) => {
  const { currentCategoryId, queryParams, articlesCount } = props;

  const topicsQuery = useQuery<TopicsQueryResponse>(
    gql(queries.knowledgeBaseTopics),
    {
      fetchPolicy: 'network-only',
    },
  );

  const topicsCountQuery = useQuery<TopicsTotalCountQueryResponse>(
    gql(queries.knowledgeBaseTopicsTotalCount),
  );

  const [removeTopicsMutation] = useMutation<RemoveTopicsMutation>(
    gql(mutations.knowledgeBaseTopicsRemove),
    {
      refetchQueries: refetchQueries(currentCategoryId),
    },
  );

  const removeTopic = (topicId) => {
    confirm().then(() => {
      removeTopicsMutation({
        variables: { _id: topicId },
      })
        .then(() => {
          topicsQuery.refetch();
          topicsCountQuery.refetch();

          Alert.success('You successfully deleted a knowledge base');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
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
    remove: removeTopic,
    renderButton,
    currentCategoryId,
    queryParams,
    articlesCount,
    topics: topicsQuery?.data?.knowledgeBaseTopics || [],
    topicsCount: topicsCountQuery?.data?.knowledgeBaseTopicsTotalCount || 0,
    loading: topicsQuery.loading || topicsCountQuery.loading,
    refetch: topicsQuery.refetch,
  };

  return <KnowledgeList {...extendedProps} />;
};

const refetchQueries = (currentCategoryId) => {
  if (!currentCategoryId) {
    return [];
  }

  return [
    {
      query: gql(queries.knowledgeBaseArticlesTotalCount),
      variables: { categoryIds: [currentCategoryId] },
    },
    {
      query: gql(queries.knowledgeBaseCategoryDetail),
      variables: { _id: currentCategoryId },
    },
  ];
};

export default KnowledgeBaseContainer;

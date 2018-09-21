import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { KnowledgeList } from '../../components';
import { mutations, queries } from '../../graphql';

type Variables = {
  title: string;
  description: string;
  brandId: string;
  languageCode: string;
  color: string;
};

type Props = {
  queryParams: any;
  topicsQuery: any;
  topicsCountQuery: any;
  currentCategoryId: string;
  articlesCount: number;

  addTopicsMutation: (params: { variables: Variables }) => Promise<any>;
  editTopicsMutation: (params: { variables: Variables }) => Promise<any>;
  removeTopicsMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

const KnowledgeBaseContainer = (props : Props) => {
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

  if (topicsQuery.loading || topicsCountQuery.loading) {
    return <Spinner objective />;
  }

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeTopicsMutation({
        variables: { _id }
      })
        .then(() => {
          topicsQuery.refetch();
          topicsCountQuery.refetch();

          Alert.success('Successfully deleted.');
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

        Alert.success('Congrats');

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

export default compose(
  graphql(gql(queries.knowledgeBaseTopics), {
    name: 'topicsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseTopicsTotalCount), {
    name: 'topicsCountQuery'
  }),
  graphql(gql(mutations.knowledgeBaseTopicsEdit), {
    name: 'editTopicsMutation'
  }),
  graphql(gql(mutations.knowledgeBaseTopicsAdd), {
    name: 'addTopicsMutation'
  }),
  graphql(gql(mutations.knowledgeBaseTopicsRemove), {
    name: 'removeTopicsMutation',
    options: ({ currentCategoryId } : { currentCategoryId: string }) => {
      return {
        refetchQueries: [
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
  })
)(KnowledgeBaseContainer);

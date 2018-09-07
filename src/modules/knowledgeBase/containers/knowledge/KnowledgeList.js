import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { KnowledgeList } from '../../components';

const KnowledgeBaseContainer = props => {
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
    ...this.props,
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

KnowledgeBaseContainer.propTypes = {
  queryParams: PropTypes.object,
  topicsQuery: PropTypes.object,
  topicsCountQuery: PropTypes.object,
  addTopicsMutation: PropTypes.func,
  editTopicsMutation: PropTypes.func,
  removeTopicsMutation: PropTypes.func,
  currentCategoryId: PropTypes.string,
  articlesCount: PropTypes.number.isRequired
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
    options: ({ currentCategoryId }) => {
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

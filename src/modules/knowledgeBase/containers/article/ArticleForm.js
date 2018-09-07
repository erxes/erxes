import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import { ArticleForm } from '../../components';

const ArticleContainer = props => {
  const {
    article,
    addArticlesMutation,
    editArticlesMutation,
    currentCategoryId
  } = props;

  // create or update action
  const save = ({ doc }, callback, object) => {
    let mutation = addArticlesMutation;

    // if edit mode
    if (object) {
      mutation = editArticlesMutation;
      doc._id = object._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        Alert.success('Congrats');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...this.props,
    save,
    article,
    currentCategoryId
  };

  return <ArticleForm {...extendedProps} />;
};

ArticleContainer.propTypes = {
  article: PropTypes.object,
  addArticlesMutation: PropTypes.func,
  editArticlesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string
};

const commonOptions = ({ queryParams, currentCategoryId, topicIds }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.knowledgeBaseArticles),
        variables: {
          categoryIds: [currentCategoryId],
          page: queryParams.page,
          perPage: queryParams.perPage || 20
        }
      },
      {
        query: gql(queries.knowledgeBaseCategories),
        variables: { topicIds: [topicIds] }
      },
      {
        query: gql(queries.knowledgeBaseArticlesTotalCount),
        variables: { categoryIds: [currentCategoryId] }
      }
    ]
  };
};

export default compose(
  graphql(gql(mutations.knowledgeBaseArticlesEdit), {
    name: 'editArticlesMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.knowledgeBaseArticlesAdd), {
    name: 'addArticlesMutation',
    options: commonOptions
  })
)(ArticleContainer);

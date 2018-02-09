import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import gql from 'graphql-tag';
import { mutations } from '../../graphql';
import { ArticleForm } from '../../components';

const ArticleContainer = props => {
  const {
    article,
    articlesQuery,
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
        // update queries
        articlesQuery.refetch();

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
  articlesQuery: PropTypes.object,
  article: PropTypes.object,
  addArticlesMutation: PropTypes.func,
  editArticlesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string
};

export default compose(
  graphql(gql(mutations.knowledgeBaseArticlesEdit), {
    name: 'editArticlesMutation'
  }),
  graphql(gql(mutations.knowledgeBaseArticlesAdd), {
    name: 'addArticlesMutation'
  })
)(ArticleContainer);

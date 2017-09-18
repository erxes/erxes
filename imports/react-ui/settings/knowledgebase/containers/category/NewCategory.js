import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';

const NewCategoryContainer = props => {
  const { getArticleListQuery, listRefetch } = props;
  const save = doc => {
    saveCallback({ doc }, 'addKbCategory', '/settings/knowledgebase/categories', listRefetch);
  };

  if (getArticleListQuery.loading) {
    return <Loading title="Add New Category" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    item: {},
    articles: getArticleListQuery.getKbArticleList,
    save,
  };
  return <KbCategory {...updatedProps} />;
};

NewCategoryContainer.propTypes = {
  getArticleListQuery: PropTypes.object,
  listRefetch: PropTypes.func,
};

export default compose(
  graphql(gql(queries.getArticleList), {
    name: 'getArticleListQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(NewCategoryContainer);

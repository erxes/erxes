import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbTopic } from '../../components';
import { saveCallback } from '../utils';

const NewTopicContainer = props => {
  const { getBrandListQuery, getCategoryListQuery, listRefetch } = props;
  const save = doc => {
    saveCallback({ doc }, 'addKbTopic', '/settings/knowledgebase/', listRefetch);
  };

  if (getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Loading title="Add New Topic" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    item: {},
    brands: getBrandListQuery.brands,
    categories: getCategoryListQuery.getKbCategoryList,
    save,
    listRefetch,
  };
  return <KbTopic {...updatedProps} />;
};

NewTopicContainer.propTypes = {
  getCategoryListQuery: PropTypes.object,
  getBrandListQuery: PropTypes.object,
  listRefetch: PropTypes.func.isRequired,
};

export default compose(
  graphql(gql(queries.getCategoryList), {
    name: 'getCategoryListQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
  graphql(gql(queries.getBrandList), {
    name: 'getBrandListQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(NewTopicContainer);

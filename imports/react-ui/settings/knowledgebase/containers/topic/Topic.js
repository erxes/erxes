import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbTopic } from '../../components';
import { saveCallback } from '../utils';

const propTypes = {
  item: PropTypes.object,
  getTopicDetailQuery: PropTypes.object,
  getCategoryListQuery: PropTypes.object,
  getBrandListQuery: PropTypes.object,
};

const TopicDetailContainer = props => {
  const { item, getTopicDetailQuery, getBrandListQuery, getCategoryListQuery } = props;

  if (getTopicDetailQuery.loading || getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Loading title="Topic Detail" sidebarSize="wide" spin hasRightSideBar />;
  }

  const save = doc => {
    let params = { doc };
    params._id = item._id;
    saveCallback(params, 'editKbTopic', '/settings/knowledgebase/', getTopicDetailQuery.refetch);
  };

  const updatedProps = {
    ...props,
    item: {
      ...getTopicDetailQuery.getKbTopicDetail,
      refetch: getTopicDetailQuery.refetch,
    },
    brands: getBrandListQuery.brands,
    categories: getCategoryListQuery.getKbCategoryList,
    save,
  };
  return <KbTopic {...updatedProps} />;
};

TopicDetailContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.getTopicDetail), {
    name: 'getTopicDetailQuery',
    options: params => {
      return {
        variables: {
          _id: params.item._id,
        },
      };
    },
  }),
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
)(TopicDetailContainer);

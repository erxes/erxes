import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbTopic } from '../../components';
import { saveCallback } from '../utils';

const TopicDetailContainer = props => {
  const { item, getTopicDetailQuery, getBrandListQuery, getCategoryListQuery } = props;
  // TODO: refetch might be needed in the props

  // refetch - used when using popups to add/edit
  if (getTopicDetailQuery.loading || getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Loading title="Topic Detail" sidebarSize="wide" spin hasRightSideBar />;
  }

  let currentMethod = 'addKbTopic';

  if (item != null && item._id) {
    currentMethod = 'editKbTopic';
  }

  const save = doc => {
    let params = { doc };
    if (item != null && item._id) {
      params._id = item._id;
    }
    saveCallback(params, currentMethod, '/settings/knowledgebase/', getTopicDetailQuery.refetch);
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
  // TODO: might need to change naming of KbTopic to smth like
  //       KbTopicDetail to be similar with other code
  return <KbTopic {...updatedProps} />;
};

TopicDetailContainer.propTypes = {
  item: PropTypes.object,
  getTopicDetailQuery: PropTypes.object,
  getCategoryListQuery: PropTypes.object,
  getBrandListQuery: PropTypes.object,
};

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

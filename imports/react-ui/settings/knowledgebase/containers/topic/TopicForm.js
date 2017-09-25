import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import { queries } from '../../graphql';
import { TopicForm } from '../../components';

const addPropTypes = {
  getCategoryListQuery: PropTypes.object.isRequired,
  getBrandListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

const editPropTypes = {
  getTopicDetailQuery: PropTypes.object.isRequired,
  getCategoryListQuery: PropTypes.object.isRequired,
  getBrandListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

const TopicEditFormContainer = props => {
  const { getTopicDetailQuery, getBrandListQuery, getCategoryListQuery } = props;

  if (getTopicDetailQuery.loading || getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Loading title="Edit topic" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    object: {
      ...getTopicDetailQuery.knowledgeBaseTopicsDetail,
      refetch: getTopicDetailQuery.refetch,
    },
    brands: getBrandListQuery.brands,
    categories: getCategoryListQuery.knowledgeBaseCategories,
  };
  return <TopicForm {...updatedProps} />;
};

TopicEditFormContainer.propTypes = editPropTypes;

const TopicAddFormContainer = props => {
  const { getBrandListQuery, getCategoryListQuery } = props;

  if (getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Loading title="Add topic" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    brands: getBrandListQuery.brands,
    categories: getCategoryListQuery.knowledgeBaseCategories,
  };
  return <TopicForm {...updatedProps} />;
};

TopicAddFormContainer.propTypes = addPropTypes;

const topicFormComposer = options => {
  const { object } = options;

  if (object && object._id) {
    return compose(
      graphql(gql(queries.getTopicDetail), {
        name: 'getTopicDetailQuery',
        options: params => {
          return {
            variables: {
              _id: params.object._id,
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
    )(TopicEditFormContainer);
  }

  return compose(
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
  )(TopicAddFormContainer);
};

export default topicFormComposer;

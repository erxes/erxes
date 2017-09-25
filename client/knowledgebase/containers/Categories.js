/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Categories as DumbCategories } from '../components';
import queries from './graphql';

const propTypes = {
  data: PropTypes.shape({
    knowledgeBaseTopicsDetail: PropTypes.object,
    loading: PropTypes.bool,
  }),
};

const Categories = (props) => {
  const extendedProps = {
    ...props,
    kbTopic: props.data.knowledgeBaseTopicsDetail,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategories {...extendedProps} />;
};

Categories.propTypes = propTypes;

const CategoriesWithData = graphql(
  gql(queries.getKbTopicQuery),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.setting.topic_id,
      },
    }),
  },
)(Categories);

export default connect()(CategoriesWithData);

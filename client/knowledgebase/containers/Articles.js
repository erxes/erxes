/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Articles as DumbArticles } from '../components';
import queries from './graphql';

const propTypes = {
  data: PropTypes.shape({
    kbSearchArticles: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
  }),
};

const Articles = (props) => {
  const extendedProps = {
    ...props,
    articles: props.data.kbSearchArticles,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbArticles {...extendedProps} />;
};

Articles.propTypes = propTypes;

const ArticlesWithData = graphql(
  gql(queries.kbSearchArticlesQuery),
  {
    options: (ownProps) => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.setting.topic_id,
        searchString: ownProps.searchString,
      },
    }),
  },
)(Articles);

export default connect()(ArticlesWithData);

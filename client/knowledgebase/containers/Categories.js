/* eslint-disable react/jsx-filename-extension */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Categories as DumbCategories } from '../components';

const Categories = (props) => {
  const extendedProps = {
    kbTopic: props.data.kbTopic,
    ...props,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategories {...extendedProps} />;
};

Categories.propTypes = {
  data: PropTypes.shape({
    kbTopic: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,

      categories: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,

        articles: PropTypes.arrayOf(PropTypes.shape({
          _id: PropTypes.string.isRequired,
          title: PropTypes.string,
          summary: PropTypes.string,
          content: PropTypes.string,
        })),
      })),
    }),
    loading: PropTypes.bool,
  }),
};

const mapStateToProps = state => ({
  currentStatus: state.currentStatus,
});

const CategoriesWithData = graphql(
  gql`
    query kbTopic($topicId: String!, $searchString: String) {
      kbTopic(topicId: $topicId, searchString: $searchString) {
        title
        description

        categories {
          _id
          title
          description

          articles {
            _id
            title
            summary
            content
          }
        }
      }
    }
  `,

  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.data.topicId,
        searchString: connection.data.searchString,
      },
    }),
  },
)(Categories);

export default connect(mapStateToProps)(CategoriesWithData);

/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Categories as DumbCategories } from '../components';

const propTypes = {
  data: PropTypes.shape({
    getKbTopic: PropTypes.object,
    loading: PropTypes.bool,
  }),
};

const Categories = (props) => {
  const extendedProps = {
    ...props,
    kbTopic: props.data.getKbTopic,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategories {...extendedProps} />;
};

Categories.propTypes = propTypes;

const CategoriesWithData = graphql(
  gql`
    query getKbTopic($topicId: String!) {
      getKbTopic(topicId: $topicId) {
        title
        description
        categories {
          _id
          title
          description
          numOfArticles
          icon
          authors {
            details {
              fullName
              avatar
            }
            articleCount
          }
          articles {
            _id
            title
            summary
            content
            createdBy
            createdDate
            modifiedBy
            modifiedDate
            authorDetails {
              fullName
              avatar
            }
          }
        }
      }
    }
  `,
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

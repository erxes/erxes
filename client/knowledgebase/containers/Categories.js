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
    kbTopic: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      categories: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        icon: PropTypes.string,
        authors: PropTypes.arrayOf(PropTypes.shape({
          details: PropTypes.shape({
            fullName: PropTypes.string,
            avatar: PropTypes.string,
          }),
          articleCount: PropTypes.string,
        })),
        numOfArticles: PropTypes.string,
        articles: PropTypes.arrayOf(PropTypes.shape({
          _id: PropTypes.string.isRequired,
          title: PropTypes.string,
          summary: PropTypes.string,
          content: PropTypes.string,
          createdBy: PropTypes.string,
          modifiedBy: PropTypes.string,
          createdDate: PropTypes.date,
          modifiedDate: PropTypes.date,
          authorDetails: PropTypes.shape({
            fullName: PropTypes.string,
            avatar: PropTypes.string,
          }),
        })),
      })),
    }),
    loading: PropTypes.bool,
  }),
};

const Categories = (props) => {
  const extendedProps = {
    ...props,
    kbTopic: props.data.kbTopic,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategories {...extendedProps} />;
};

Categories.propTypes = propTypes;

const CategoriesWithData = graphql(
  gql`
    query kbTopic($topicId: String!) {
      kbTopic(topicId: $topicId) {
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
    options: (ownProps) => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.setting.topic_id,
      },
    }),
  },
)(Categories);

export default connect()(CategoriesWithData);

import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Categories as DumbCategories } from '../components';
import queries from './graphql';

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

Categories.propTypes = {
  data: PropTypes.object,
};

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

export default CategoriesWithData;

import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Articles as DumbArticles } from '../components';
import { AppConsumer } from './AppContext';
import queries from './graphql';

const Articles = (props) => {
  const extendedProps = {
    ...props,
    articles: props.data.knowledgeBaseArticles,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbArticles {...extendedProps} />;
};

Articles.propTypes = {
  data: PropTypes.object
};

const WithData = graphql(
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

const WithContext = (props) => ((
  <AppConsumer>
    {({ searchString }) =>
      <WithData {...props} searchString={searchString} />
    }
  </AppConsumer>
));

export default WithContext;

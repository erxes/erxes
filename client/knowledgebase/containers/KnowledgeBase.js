import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { setLocale } from '../../utils';
import TranslationWrapper from '../../TranslationWrapper';
import { KnowledgeBase } from '../components';
import { connection } from '../connection';
import queries from './graphql';
import { AppProvider, AppConsumer } from './AppContext';

const Topic = (props) => {
  const { data: { loading, knowledgeBaseTopicsDetail } } = props;

  if (loading) {
    return null;
  }

  const { color, languageCode } = knowledgeBaseTopicsDetail;

  // set language
  setLocale(languageCode);

  return (
    <TranslationWrapper>
      <AppProvider>
        <AppConsumer>
          {({ activeRoute }) => {
            return (
              <KnowledgeBase
                {...props}
                color={color}
                activeRoute={activeRoute}
              />
            );
          }}
        </AppConsumer>
      </AppProvider>
    </TranslationWrapper>
  );
};

Topic.propTypes = {
  data: PropTypes.object,
};

const TopicWithData = graphql(
  gql(queries.getKbTopicQuery),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.setting.topic_id,
      },
    }),
  },
)(Topic);

export default TopicWithData;

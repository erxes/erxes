/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { setLocale } from '../../utils';
import TranslationWrapper from '../../TranslationWrapper';
import { KnowledgeBase } from '../components';
import { connection } from '../connection';
import { switchToCategoryDisplay, switchToTopicDisplay } from '../actions';
import queries from './graphql';

const mapStateToProps = state => ({
  displayType: state.displayType,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToTopicDisplay() {
    dispatch(switchToTopicDisplay());
  },

  onSwitchToCategoryDisplay(category) {
    dispatch(switchToCategoryDisplay(category));
  },
});

const propTypes = {
  data: PropTypes.shape({
    knowledgeBaseTopicsDetail: PropTypes.object,
    loading: PropTypes.bool,
  }),
};

const Topic = (props) => {
  const { data: { loading, knowledgeBaseTopicsDetail } } = props;

  if (loading) {
    return null;
  }

  const { color, languageCode } = knowledgeBaseTopicsDetail;

  // set language
  setLocale(languageCode);

  const updatedProps = {
    ...props,
    color,
  }

  return (
    <TranslationWrapper>
      <KnowledgeBase {...updatedProps}/>
    </TranslationWrapper>
  );
};

Topic.propTypes = propTypes;

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

export default connect(mapStateToProps, mapDisptachToProps)(TopicWithData);

/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
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

const TopicColor = (props) => {
  let color = '';

  if (props.data.loading) {
    return (<div></div>);
  } else {
    color = props.data.knowledgeBaseTopicsDetail.color;
  }

  const updatedProps = {
    ...props,
    color,
  }
  return (<KnowledgeBase {...updatedProps}/>);
};

TopicColor.propTypes = propTypes;

const TopicColorWithData = graphql(
  gql(queries.getKbTopicColorQuery),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        topicId: connection.setting.topic_id,
      },
    }),
  },
)(TopicColor);

export default connect(mapStateToProps, mapDisptachToProps)(TopicColorWithData);
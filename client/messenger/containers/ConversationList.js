import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { connection } from '../connection';
import { readMessages } from '../actions/messages';
import { changeRoute, changeConversation } from '../actions/messenger';
import { ConversationList as DumbConversationList } from '../components';

class ConversationList extends Component {
  componentDidUpdate() {
    if (this.props.isConversationEnded) {
      this.props.data.refetch();
    }
  }

  render() {
    const { data } = this.props;

    let conversations = data.conversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    const extendedProps = {
      ...this.props,
      conversations,
    };

    return <DumbConversationList {...extendedProps} />;
  }
}

ConversationList.propTypes = {
  data: PropTypes.shape({
    conversations: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date),
    })),
    refetch: PropTypes.func,
  }),
  isConversationEnded: PropTypes.bool,
};


const mapDisptachToProps = dispatch => ({
  createConversation(e) {
    e.preventDefault();
    dispatch(changeRoute('conversation'));
  },

  goToConversation(conversationId) {
    // change current conversation
    dispatch(changeConversation(conversationId));

    // change route
    dispatch(changeRoute('conversation'));

    // mark as read
    dispatch(readMessages(conversationId));
  },
});

const mapStateToProps = state => ({
  isConversationEnded: state.isConversationEnded,
});

const ListWithData = graphql(
  gql`
    query allConversations(${connection.queryVariables}) {
      conversations(${connection.queryParams}) {
        _id
        content
        createdAt
        participatedUsers {
          details {
            fullName
            avatar
          }
        }
      }
    }
  `,

  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(ConversationList);

export default connect(mapStateToProps, mapDisptachToProps)(ListWithData);

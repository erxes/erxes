import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { MessagesList } from '../components';

const mapStateToProps = state => ({
  conversationId: state.activeConversation,
});

const withData = graphql(
  gql`
    query ($conversationId: String!) {
      messages(conversationId: $conversationId) {
        _id
        content
        createdAt
        attachments{
          url
          name
          size
          type
        }
      }
    }
  `,
  {
    options: (ownProps) => ({
      pollInterval: 1000,
      variables: { conversationId: ownProps.conversationId },
    }),
  }
);

const ListWithData = withData(MessagesList);

export default connect(mapStateToProps)(ListWithData);

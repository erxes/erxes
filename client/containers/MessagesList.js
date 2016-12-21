import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { MessagesList as BaseMessageList } from '../components';


const messageQuery = `
  _id
  content
  createdAt
  attachments{
    url
    name
    size
    type
  }
`;

const messageInserted = gql`
  subscription messageInserted {
    messageInserted {
      ${messageQuery}
    }
  }
`;

class MessagesList extends BaseMessageList {
  constructor(props) {
    super(props);

    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      const { subscribeToMore } = this.props.data;

      this.subscription = [subscribeToMore(
        {
          document: messageInserted,
          updateQuery: (previousResult, { subscriptionData }) => {
            previousResult.messages.push(subscriptionData.data.messageInserted);
            return previousResult;
          },
        }
      )];
    }
  }
}

const mapStateToProps = state => ({
  conversationId: state.activeConversation,
});

const withData = graphql(
  gql`
    query ($conversationId: String!) {
      messages(conversationId: $conversationId) {
        ${messageQuery}
      }
    }
  `,
  {
    options: (ownProps) => ({
      variables: { conversationId: ownProps.conversationId },
    }),
  }
);

const ListWithData = withData(MessagesList);

export default connect(mapStateToProps)(ListWithData);

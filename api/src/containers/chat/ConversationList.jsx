import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Conversation from '../../components/chat/Conversation';


const propTypes = {
  conversations: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    conversation: PropTypes.string.isRequired,
    userId: PropTypes.string,
    customerId: PropTypes.string,
    sentAt: PropTypes.object.isRequired,
  }).isRequired).isRequired,
};

class ConversationList extends Component {
  render() {
    return (
      <div className="erxes-content-container no-space">
        <ul className="erxes-conversations">

          {this.props.conversations.map(conversation =>
            <Conversation
              key={conversation._id}
              {...conversation}
            />
          )}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  conversations: [],
});

ConversationList.propTypes = propTypes;

export default connect(mapStateToProps)(ConversationList) ;

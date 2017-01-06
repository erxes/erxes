import React, { PropTypes, Component } from 'react';
import ListRow from '../../../inbox/components/list/Row.jsx';


const propTypes = {
  conversations: PropTypes.array.isRequired,
};

class Conversations extends Component {
  render() {
    const userId = Meteor.userId();

    return (
      <ul className="conversations-list">
        {
          this.props.conversations.map(conv =>
            <ListRow
              starred={false}
              conversation={conv}
              key={conv._id}
              isParticipate={
                conv.participatedUserIds && conv.participatedUserIds.indexOf(userId) > -1
              }
              isRead={conv.readUserIds && conv.readUserIds.indexOf(userId) > -1}
            />
          )
        }
      </ul>
    );
  }
}

Conversations.propTypes = propTypes;

export default Conversations;

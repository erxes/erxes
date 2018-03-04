import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  history: PropTypes.object
};

class UserDetails extends React.Component {
  render() {
    const { user, history } = this.props;
    const { details = {} } = user;

    const breadcrumb = [
      { title: 'Users', link: '/settings/team' },
      { title: details.fullName || 'N/A' }
    ];

    const content = (
      <div>
        {user.conversations.map(conversation => {
          return (
            <div key={conversation._id}>
              Sent a
              <a
                onClick={() => {
                  history.push(`inbox?_id=${conversation._id}`);
                }}
              >
                conversation
              </a>
              message -
              {conversation.content}
            </div>
          );
        })}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar user={user} />}
        content={content}
        transparent={true}
      />
    );
  }
}

UserDetails.propTypes = propTypes;

export default withRouter(UserDetails);

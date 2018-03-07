import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { NameCard } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import {
  ActivityRow,
  ActivityWrapper,
  AvatarWrapper,
  ActivityCaption,
  ActivityDate
} from 'modules/activityLogs/styles';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  saveProfile: PropTypes.func.isRequired,
  saveUser: PropTypes.func.isRequired,
  channels: PropTypes.array
};

class UserDetails extends React.Component {
  render() {
    const { user } = this.props;
    const { details = {} } = user;

    const breadcrumb = [
      { title: 'Users', link: '/settings/team' },
      { title: details.fullName || 'N/A' }
    ];

    const content = (
      <div>
        {user.conversations.map(conversation => {
          return (
            <ActivityRow key={conversation._id}>
              <ActivityWrapper>
                <AvatarWrapper>
                  <NameCard.Avatar user={user} size={50} />
                </AvatarWrapper>

                <ActivityCaption>
                  {user.details.fullName} had{' '}
                  <Link to={`/inbox?_id=${conversation._id}`}>
                    <strong>conversation</strong>
                  </Link>{' '}
                  with{' '}
                  <Link to={`/customers/details/${conversation.customer._id}`}>
                    <strong>{renderFullName(conversation.customer)}</strong>
                  </Link>
                </ActivityCaption>

                <ActivityDate>
                  {moment(conversation.createdAt).fromNow()}
                </ActivityDate>
              </ActivityWrapper>
            </ActivityRow>
          );
        })}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

UserDetails.propTypes = propTypes;
UserDetails.contextTypes = {
  __: PropTypes.func
};

export default UserDetails;

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';
import { NameCard, DropdownToggle, Icon } from 'modules/common/components';
import { UserHelper } from '../styles';

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    float: none;
    margin: 0 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
`;

const QuickNavigation = ({ logout }) => {
  const user = {
    username: 'batamar',
    details: {
      avatar:
        'https://s3.amazonaws.com/erxes/0.05832306598313153black-avatar.jpg',
      fullName: 'Bat-Amar Battulga ',
      role: 'admin',
      starredConversationIds: ['HjfaTNDFt8cDHGmYx'],
      twitterUsername: 'b_batamar',
      position: 'Web Developer at The New Media Group',
      getNotificationByEmail: true
    },
    emails: null
  };

  return (
    <Dropdown id="dropdown-user" pullRight>
      <DropdownToggle bsRole="toggle">
        <UserHelper>
          <UserInfo>
            <span>{user.details.fullName}</span>
            <NameCard.Avatar user={user} size={30} />
            <Icon icon="chevron-down" />
          </UserInfo>
        </UserHelper>
      </DropdownToggle>
      <Dropdown.Menu>
        <NameCardWrapper>
          <NameCard user={user} />
        </NameCardWrapper>
        <MenuItem divider />
        <MenuItem href="/settings/profile">Edit Profile</MenuItem>
        <MenuItem href="/change-password">Change password</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={logout}>Sign out</MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  );
};

QuickNavigation.propTypes = {
  logout: PropTypes.func
};

export default QuickNavigation;

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown, MenuItem, DropdownButton } from 'react-bootstrap';
import styled from 'styled-components';
import { NameCard, DropdownToggle, Icon } from 'modules/common/components';
import { UserHelper } from '../styles';
import { Widget } from 'modules/notifications/containers';

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
`;

const NavItem = styled.div`
  padding-left: 20px;
  display: table-cell;
  vertical-align: middle;
`;

const QuickNavigation = (
  { logout, currentUser, selectLang, locale },
  { __ }
) => {
  return (
    <nav>
      <NavItem>
        <DropdownButton
          bsStyle="default"
          title={locale || 'EN'}
          noCaret
          onSelect={e => selectLang(e)}
          id="dropdown-no-caret"
        >
          <MenuItem eventKey="en">en</MenuItem>
          <MenuItem eventKey="mn">mn</MenuItem>
        </DropdownButton>
      </NavItem>
      <NavItem>
        <Widget />
      </NavItem>
      <NavItem>
        <Dropdown id="dropdown-user" pullRight>
          <DropdownToggle bsRole="toggle">
            <UserHelper>
              <UserInfo>
                {currentUser.details.fullName}
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="chevron-down" size={10} />
              </UserInfo>
            </UserHelper>
          </DropdownToggle>
          <Dropdown.Menu>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuItem divider />
            <li>
              <Link to="/settings/profile">{__('Edit Profile')}</Link>
            </li>
            <li>
              <Link to="/settings/change-password">
                {__('Change password')}
              </Link>
            </li>
            <MenuItem divider />
            <MenuItem onClick={logout}>{__('Sign out')}</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

QuickNavigation.propTypes = {
  logout: PropTypes.func,
  currentUser: PropTypes.object.isRequired,
  selectLang: PropTypes.func,
  locale: PropTypes.string
};

QuickNavigation.contextTypes = {
  locale: PropTypes.string,
  selectLang: PropTypes.func,
  __: PropTypes.func
};

export default QuickNavigation;

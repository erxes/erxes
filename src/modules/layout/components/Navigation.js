import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { Tip, Icon, Label } from 'modules/common/components';

const LeftNavigation = styled.aside`
  width: ${dimensions.headerSpacingWide}px;
  background: ${colors.colorCoreBlack};
  flex-shrink: 0;

  > a {
    background-color: ${rgba(colors.colorPrimary, 0.7)};
    line-height: ${dimensions.headerSpacing}px;
    display: flex;
    height: ${dimensions.headerSpacing}px;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
`;

const Nav = styled.nav`
  display: block;
  background: ${colors.colorCoreBlack};
  margin-top: 10px;

  > a {
    display: block;
    text-align: center;
    height: ${dimensions.headerSpacing + 10}px;
    font-size: ${dimensions.coreSpacing}px;
    line-height: ${dimensions.headerSpacing + 10}px;
    text-align: center;
    color: ${rgba(colors.colorWhite, 0.7)};
    position: relative;

    span {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 4px;
      min-width: 19px;
      min-height: 19px;
    }

    &:hover {
      color: ${colors.colorWhite};
    }

    &.active {
      position: relative;
      color: ${colors.colorWhite};
      background: rgba(0, 0, 0, 0.2);
    }

    > i {
      margin: 0;
    }
  }
`;

class Navigation extends Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.unreadConversationsCount > this.props.unreadConversationsCount
    ) {
      const audio = new Audio('/sound/notify.mp3');
      audio.play();
    }
  }

  render() {
    const { unreadConversationsCount } = this.props;
    return (
      <LeftNavigation>
        <NavLink to="/" activeClassName="active">
          <img src="/images/logo-image.png" alt="erxes" />
        </NavLink>
        <Nav>
          <Tip placement="right" text="Inbox">
            <NavLink to="/inbox" activeClassName="active">
              <Icon icon="android-textsms" />
              {unreadConversationsCount !== 0 && (
                <Label shake lblStyle="danger">
                  {unreadConversationsCount}
                </Label>
              )}
            </NavLink>
          </Tip>
          <Tip placement="right" text="Customers">
            <NavLink to="/customers" activeClassName="active">
              <Icon icon="person-stalker" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Companies">
            <NavLink to="/companies" activeClassName="active">
              <Icon icon="briefcase" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Engage">
            <NavLink to="/engage" activeClassName="active">
              <Icon icon="speakerphone" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Insights">
            <NavLink to="/insights" activeClassName="active">
              <Icon icon="pie-graph" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Settings">
            <NavLink to="/settings" activeClassName="active">
              <Icon icon="gear-b" />
            </NavLink>
          </Tip>
        </Nav>
      </LeftNavigation>
    );
  }
}

Navigation.propTypes = {
  unreadConversationsCount: PropTypes.number
};

export default Navigation;

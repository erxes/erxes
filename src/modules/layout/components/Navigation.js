import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { setBadge } from 'modules/common/utils';
import { colors, dimensions } from 'modules/common/styles';
import { Tip, Label } from 'modules/common/components';

const LeftNavigation = styled.aside`
  width: ${dimensions.headerSpacingWide}px;
  background: ${colors.colorPrimaryDark};
  z-index: 10;
  flex-shrink: 0;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;

  > a {
    line-height: ${dimensions.headerSpacing}px;
    display: flex;
    height: ${dimensions.headerSpacing}px;
    justify-content: center;
    align-items: center;
    color: #fff;

    img {
      max-height: 28px;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
`;

const Nav = styled.nav`
  display: block;
  margin-top: ${dimensions.coreSpacing}px;

  > a {
    display: block;
    height: ${dimensions.headerSpacing + 10}px;
    text-align: center;
    position: relative;
    transition: all 0.3s ease;

    i {
      margin-top: 20px;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    span {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 4px;
      min-width: 19px;
      min-height: 19px;
    }

    &:hover,
    &.active {
      opacity: 1;

      i {
        opacity: 1;
      }
    }

    &.active {
      background: rgba(0, 0, 0, 0.13);
    }
  }
`;

const NavIcon = styled.i`
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 18px;
  height: 18px;
  display: inline-block;

  &.icon-inbox {
    background-image: url('/images/icons/nav-01.svg');
  }

  &.icon-customer {
    background-image: url('/images/icons/nav-02.svg');
  }

  &.icon-company {
    background-image: url('/images/icons/nav-03.svg');
  }

  &.icon-engage {
    background-image: url('/images/icons/nav-04.svg');
  }

  &.icon-insights {
    background-image: url('/images/icons/nav-05.svg');
  }

  &.icon-settings {
    background-image: url('/images/icons/nav-06.svg');
  }

  &.icon-knowledge {
    background-image: url('/images/icons/nav-07.svg');
  }
`;

class Navigation extends Component {
  componentDidUpdate() {
    setBadge(this.props.unreadConversationsCount);
  }

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
          <img src="/images/erxes.png" alt="erxes" />
        </NavLink>
        <Nav>
          <Tip placement="right" text="Inbox">
            <NavLink to="/inbox" activeClassName="active">
              <NavIcon className="icon-inbox" />
              {unreadConversationsCount !== 0 && (
                <Label shake lblStyle="danger">
                  {unreadConversationsCount}
                </Label>
              )}
            </NavLink>
          </Tip>
          <Tip placement="right" text="Customers">
            <NavLink to="/customers" activeClassName="active">
              <NavIcon className="icon-customer" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Companies">
            <NavLink to="/companies" activeClassName="active">
              <NavIcon className="icon-company" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Engage">
            <NavLink to="/engage" activeClassName="active">
              <NavIcon className="icon-engage" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Insights">
            <NavLink to="/insights" activeClassName="active">
              <NavIcon className="icon-insights" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Knowledge Base">
            <NavLink to="/knowledgeBase" activeClassName="active">
              <NavIcon className="icon-knowledge" />
            </NavLink>
          </Tip>
          <Tip placement="right" text="Settings">
            <NavLink to="/settings" activeClassName="active">
              <NavIcon className="icon-settings" />
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

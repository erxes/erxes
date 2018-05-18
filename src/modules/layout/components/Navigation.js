import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Widget } from 'modules/notifications/containers';
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
    display: flex;
    margin-top: ${dimensions.unitSpacing}px;
    height: ${dimensions.headerSpacing}px;
    justify-content: center;
    align-items: center;

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
  margin-top: ${dimensions.unitSpacing}px;
  height: calc(100% - 130px);
  overflow: auto;

  > a {
    display: block;
    height: ${dimensions.headerSpacing + 10}px;
    text-align: center;
    position: relative;
    transition: all 0.3s ease;

    i {
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

    &.active {
      background: rgba(0, 0, 0, 0.13);

      &:before {
        content: '';
        width: 2px;
        background: ${colors.colorCoreTeal};
        position: absolute;
        display: block;
        left: 0;
        top: 0;
        bottom: 0;
      }

      i {
        opacity: 1;
      }
    }

    &:focus {
      outline: 0;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);

      i {
        opacity: 1;
      }
    }

    @media (max-height: 760px) {
      height: ${dimensions.headerSpacing}px;

      i {
        line-height: ${dimensions.headerSpacing}px;
      }
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavIcon = styled.i`
  font-size: 16px;
  line-height: ${dimensions.headerSpacing + 10}px;
  color: ${colors.colorWhite};
`;

class Navigation extends Component {
  componentDidUpdate() {
    const { __ } = this.context;
    setBadge(this.props.unreadConversationsCount, __('Inbox'));
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
    const { __ } = this.context;
    return (
      <LeftNavigation>
        <NavLink to="/">
          <img src="/images/erxes.png" alt="erxes" />
        </NavLink>
        <Nav>
          <Tip placement="right" text={__('Inbox')}>
            <NavLink to="/inbox" activeClassName="active">
              <NavIcon className="icon-chat" />
              {unreadConversationsCount !== 0 && (
                <Label shake lblStyle="danger" ignoreTrans>
                  {unreadConversationsCount}
                </Label>
              )}
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Deal')}>
            <NavLink to="/deals" activeClassName="active">
              <NavIcon className="icon-piggy-bank" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Customers')}>
            <NavLink to="/customers" activeClassName="active">
              <NavIcon className="icon-users" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Companies')}>
            <NavLink to="/companies" activeClassName="active">
              <NavIcon className="icon-briefcase" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Forms')}>
            <NavLink to="/forms" activeClassName="active">
              <NavIcon className="icon-laptop" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Engage')}>
            <NavLink to="/engage" activeClassName="active">
              <NavIcon className="icon-megaphone" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Knowledge Base')}>
            <NavLink to="/knowledgeBase" activeClassName="active">
              <NavIcon className="icon-clipboard" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Insights')}>
            <NavLink to="/insights" activeClassName="active">
              <NavIcon className="icon-pie-chart" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Settings')}>
            <NavLink to="/settings" activeClassName="active">
              <NavIcon className="icon-settings" />
            </NavLink>
          </Tip>
        </Nav>
        <Widget />
      </LeftNavigation>
    );
  }
}

Navigation.propTypes = {
  unreadConversationsCount: PropTypes.number
};

Navigation.contextTypes = {
  __: PropTypes.func
};

export default Navigation;

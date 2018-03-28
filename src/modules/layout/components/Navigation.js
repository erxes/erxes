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
    margin-top: ${dimensions.unitSpacing}px;
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
  margin-top: ${dimensions.unitSpacing}px;

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

  &.icon-deal {
    background-image: url('/images/icons/nav-08.svg');
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
    const { __ } = this.context;
    return (
      <LeftNavigation>
        <NavLink to="/" activeClassName="active">
          <img src="/images/erxes.png" alt="erxes" />
        </NavLink>
        <Nav>
          <Tip placement="right" text={__('Inbox')}>
            <NavLink to="/inbox" activeClassName="active">
              <NavIcon className="icon-inbox" />
              {unreadConversationsCount !== 0 && (
                <Label shake lblStyle="danger" ignoreTrans>
                  {unreadConversationsCount}
                </Label>
              )}
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Deal')}>
            <NavLink to="/deals" activeClassName="active">
              <NavIcon className="icon-deal" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Customers')}>
            <NavLink to="/customers" activeClassName="active">
              <NavIcon className="icon-customer" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Companies')}>
            <NavLink to="/companies" activeClassName="active">
              <NavIcon className="icon-company" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Engage')}>
            <NavLink to="/engage" activeClassName="active">
              <NavIcon className="icon-engage" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Knowledge Base')}>
            <NavLink to="/knowledgeBase" activeClassName="active">
              <NavIcon className="icon-knowledge" />
            </NavLink>
          </Tip>
          <Tip placement="right" text={__('Insights')}>
            <NavLink to="/insights" activeClassName="active">
              <NavIcon className="icon-insights" />
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

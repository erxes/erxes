import { Label, Tip, WithPermission } from 'modules/common/components';
import { colors, dimensions } from 'modules/common/styles';
import { __, setBadge } from 'modules/common/utils';
import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/deals/constants';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

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
    margin-top: ${dimensions.unitSpacing / 2}px;
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
  margin-top: ${dimensions.unitSpacing / 2}px;
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
        width: 3px;
        background: ${colors.colorCoreTeal};
        position: absolute;
        display: block;
        left: 0;
        top: 5px;
        bottom: 5px;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }

      i {
        opacity: 1;
      }
    }

    &:focus {
      outline: 0;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.06);

      i {
        opacity: 1;
      }
    }

    &.bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
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

class Navigation extends React.Component<{
  unreadConversationsCount?: number;
}> {
  componentWillReceiveProps(nextProps) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __('Inbox').toString());
    }
  }

  render() {
    const { unreadConversationsCount } = this.props;

    let dealsLink = '/deals/board';

    const lastBoardId = localStorage.getItem(STORAGE_BOARD_KEY);
    const lastPipelineId = localStorage.getItem(STORAGE_PIPELINE_KEY);

    if (lastBoardId && lastPipelineId) {
      dealsLink = `/deals/board?id=${lastBoardId}&pipelineId=${lastPipelineId}`;
    }

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img src="/images/erxes.png" alt="erxes" />
        </NavLink>
        <Nav>
          <WithPermission action="showConversations">
            <Tip placement="right" text={__('Inbox').toString()}>
              <NavLink to="/inbox">
                <NavIcon className="icon-chat" />
                {unreadConversationsCount !== 0 && (
                  <Label shake={true} lblStyle="danger" ignoreTrans={true}>
                    {unreadConversationsCount}
                  </Label>
                )}
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showDeals">
            <Tip placement="right" text={__('Deal').toString()}>
              <NavLink to={dealsLink}>
                <NavIcon className="icon-piggy-bank" />
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showCustomers">
            <Tip placement="right" text={__('Customers').toString()}>
              <NavLink to="/customers">
                <NavIcon className="icon-users" />
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showCompanies">
            <Tip placement="right" text={__('Companies').toString()}>
              <NavLink to="/companies">
                <NavIcon className="icon-briefcase" />
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showFields">
            <Tip placement="right" text={__('Leads').toString()}>
              <NavLink to="/forms">
                <NavIcon className="icon-laptop" />
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showEngagesMessages">
            <Tip placement="right" text={__('Engage').toString()}>
              <NavLink to="/engage">
                <NavIcon className="icon-megaphone" />
              </NavLink>
            </Tip>
          </WithPermission>
          <WithPermission action="showKnowledgeBase">
            <Tip placement="right" text={__('Knowledge Base').toString()}>
              <NavLink to="/knowledgeBase">
                <NavIcon className="icon-clipboard" />
              </NavLink>
            </Tip>
            <WithPermission action="showIntegrations">
              <Tip placement="right" text={__('App store').toString()}>
                <NavLink to="/settings/integrations" className="bottom">
                  <NavIcon className="icon-menu" />
                </NavLink>
              </Tip>
            </WithPermission>
          </WithPermission>
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;

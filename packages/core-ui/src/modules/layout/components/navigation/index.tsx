import React from 'react';
import { NavLink } from 'react-router-dom';

import { LeftNavigation, FlexBox, BottomMenu } from '../../styles';

import { __, readFile, setBadge } from 'modules/common/utils';

import NavigationToggler from './NavigationToggler';
import NavigationList from './NavigationList';
import NavigationItem from './NavigationItem';
import NavigationGoto from './NavigationGoto';

import { getThemeItem } from 'utils';

type Props = {
  unreadConversationsCount?: number;
  navCollapse: number;
  onClickHandleIcon: (event: any) => void;
};

export default class Navigation extends React.Component<Props> {
  componentWillReceiveProps(nextProps: any) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __('Team Inbox').toString());
    }
  }

  render() {
    const {
      unreadConversationsCount,
      navCollapse,
      onClickHandleIcon
    } = this.props;

    const generateLogoSource = (): string => {
      const logo =
        this.props.navCollapse === 1 ? 'glyph_dark.png' : 'logo-dark.png';
      const thLogo = getThemeItem('logo');

      return thLogo ? readFile(thLogo) : `/images/${logo}`;
    };

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img src={generateLogoSource()} alt="erxes" />
        </NavLink>

        <FlexBox navCollapse={navCollapse}>
          <NavigationToggler
            navCollapse={navCollapse}
            onClickHandleIcon={onClickHandleIcon}
          />
        </FlexBox>

        <NavigationGoto navCollapse={navCollapse} />

        <NavigationList
          navCollapse={navCollapse}
          unreadConversationsCount={unreadConversationsCount}
        />

        <BottomMenu>
          <NavigationItem
            plugin={{
              text: 'Settings',
              url: '/settings',
              icon: 'icon-settings'
            }}
            navCollapse={navCollapse}
          />
        </BottomMenu>
      </LeftNavigation>
    );
  }
}

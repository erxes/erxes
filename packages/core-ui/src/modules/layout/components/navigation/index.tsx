import { BottomMenu, FlexBox, LeftNavigation, NavImage } from '../../styles';
import { __, readFile } from 'modules/common/utils';
import { getThemeItem, getVersion } from '@erxes/ui/src/utils/core';

import { NavLink } from 'react-router-dom';
import NavigationGoto from './NavigationGoto';
import NavigationItem from './NavigationItem';
import NavigationList from './NavigationList';
import NavigationToggler from './NavigationToggler';
import React from 'react';

type Props = {
  navCollapse: number;
  onClickHandleIcon: (type: string) => void;
};

export default class Navigation extends React.Component<Props> {
  render() {
    const { navCollapse, onClickHandleIcon } = this.props;
    const { VERSION } = getVersion();

    const generateLogoSource = (): string => {
      const logo =
        this.props.navCollapse === 1 ? 'glyph_dark.png' : 'logo-dark.png';
      const thLogo = getThemeItem('logo');

      return thLogo ? readFile(thLogo) : `/images/${logo}`;
    };

    return (
      <LeftNavigation>
        <NavLink to="/welcome">
          <NavImage
            $navCollapse={navCollapse}
            src={generateLogoSource()}
            alt="erxes"
          />
        </NavLink>

        <FlexBox $navCollapse={navCollapse}>
          <NavigationToggler
            navCollapse={navCollapse}
            onClickHandleIcon={onClickHandleIcon}
          />
        </FlexBox>

        <NavigationGoto navCollapse={navCollapse} />

        <NavigationList navCollapse={navCollapse} />

        <BottomMenu>
          {!VERSION || VERSION !== 'saas' ? (
            <NavigationItem
              plugin={{
                text: 'Marketplace',
                url: '/marketplace',
                icon: 'icon-store',
              }}
              navCollapse={navCollapse}
            />
          ) : null}

          <NavigationItem
            plugin={{
              text: 'Settings',
              url: '/settings',
              icon: 'icon-settings',
            }}
            navCollapse={navCollapse}
          />
        </BottomMenu>
      </LeftNavigation>
    );
  }
}

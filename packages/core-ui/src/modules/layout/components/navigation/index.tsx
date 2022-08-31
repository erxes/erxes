import { BottomMenu, FlexBox, LeftNavigation, NavImage } from '../../styles';
import { __, readFile } from 'modules/common/utils';

import { NavLink } from 'react-router-dom';
import NavigationGoto from './NavigationGoto';
import NavigationItem from './NavigationItem';
import NavigationList from './NavigationList';
import NavigationToggler from './NavigationToggler';
import React from 'react';
import { getThemeItem } from 'utils';

type Props = {
  navCollapse: number;
  onClickHandleIcon: (event: any) => void;
};

export default class Navigation extends React.Component<Props> {
  render() {
    const { navCollapse, onClickHandleIcon } = this.props;

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
            navCollapse={navCollapse}
            src={generateLogoSource()}
            alt="erxes"
          />
        </NavLink>

        <FlexBox navCollapse={navCollapse}>
          <NavigationToggler
            navCollapse={navCollapse}
            onClickHandleIcon={onClickHandleIcon}
          />
        </FlexBox>

        <NavigationGoto navCollapse={navCollapse} />

        <NavigationList navCollapse={navCollapse} />

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

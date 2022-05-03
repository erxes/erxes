import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  NavItem,
  NavMenuItem,
  NavIcon
} from '../../styles';

import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils'

import NavigationItemChild from './NavigationItemChild';

import { getLink } from './utils';
import { Plugin } from './types';

type Props = {
  plugin: Plugin,
  navCollapse: number,
  showMenu?: boolean,
  clickedMenu?: string,
  toggleMenu?: (text: string) => void,
}

export default function NavigationItem(props: Props) {
  const { plugin, navCollapse, showMenu, clickedMenu, toggleMenu } = props

  return (
    <WithPermission key={plugin.url} action={plugin.permission ? plugin.permission : ''}>
      <NavItem isMoreItem={false}>
        <NavMenuItem isMoreItem={false} navCollapse={navCollapse}>
          <NavLink
            to={getLink(plugin.url)}
            onClick={() => toggleMenu && toggleMenu(plugin.text)}
          >
            {navCollapse === 1
              ? <NavIcon className={plugin.icon} />
              : (
                <React.Fragment>
                  <NavIcon className={plugin.icon} />
                  <label>{plugin.text}</label>
                </React.Fragment>
              )
            }
          </NavLink>
        </NavMenuItem>

        <NavigationItemChild
          plugin={plugin}
          navCollapse={navCollapse}
          showMenu={showMenu}
          clickedMenu={clickedMenu}
        />
      </NavItem>
    </WithPermission>
  )
};
import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  NavItem,
  NavMenuItem,
  NavIcon
} from '../../styles';

import WithPermission from 'modules/common/components/WithPermission';
import Tip from "modules/common/components/Tip";
import { __ } from 'modules/common/utils';

import NavigationChildList from './NavigationListChild';

import { getLink, getChildren } from './utils';
import { Plugin, ChildPlugin } from './types';

type Props = {
  plugin: Plugin,
  navCollapse: number,
  showMenu?: boolean,
  clickedMenu?: string,
  toggleMenu?: (text: string) => void,
}

export default function NavigationItem(props: Props) {
  const {
    plugin,
    navCollapse,
    showMenu,
    clickedMenu,
    toggleMenu
  } = props;

  const children: ChildPlugin[] = getChildren(plugin);

  const navMenuItemElement = (
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
  )

  return (
    <WithPermission key={plugin.url} action={plugin.permission ? plugin.permission : ''}>
      <NavItem isMoreItem={false}>
        {children.length === 0 || plugin.text !== "Settings"
          ? (
            <Tip placement="right" key={Math.random()} text={__(plugin.text)}>
              {navMenuItemElement}
            </Tip>
          )
          : navMenuItemElement
        }

        <NavigationChildList
          plugin={plugin}
          children={children}
          navCollapse={navCollapse}
          showMenu={showMenu}
          clickedMenu={clickedMenu}
        />
      </NavItem>
    </WithPermission>
  )
};
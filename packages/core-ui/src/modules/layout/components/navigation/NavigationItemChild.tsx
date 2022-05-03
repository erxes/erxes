import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  SubNav,
  SubNavTitle,
  SubNavItem,
  DropSubNav,
  DropSubNavItem,
} from '../../styles'

import WithPermission from "modules/common/components/WithPermission";
import { __ } from 'modules/common/utils'

import { getLink } from './utils';
import { Plugin } from './types';

type Props = {
  plugin: Plugin,
  navCollapse: number,
  showMenu?: boolean,
  clickedMenu?: string
}

function NavigationItemChild(props: Props) {
  const {
    plugin,
    navCollapse,
    showMenu,
    clickedMenu
  } = props;

  function renderItem(type: string) {
    if (plugin.children)
      return plugin.children.map((child, index) => {
        if (plugin.name && child.scope !== plugin.name) {
          return null;
        }
    
        if (
          child.scope === "cards" &&
          !child.text.toLowerCase().includes(plugin.text.toLowerCase())
        ) {
          return null;
        }
    
        const link = (
          <NavLink to={getLink(child.to)}>{__(child.text)}</NavLink>
        );

        return (
          <WithPermission key={index} action={child.permission}>
            {type === 'vertical'
              ? <SubNavItem additional={child.additional || false}>{link}</SubNavItem>
              : <DropSubNavItem>{link}</DropSubNavItem>
            }
          </WithPermission>
        )
      });
    else
      return '';
  };

  if (
    navCollapse === 3 &&
    clickedMenu === plugin.text &&
    showMenu &&
    (plugin.children && plugin.children.length !== 0)
  ) {
    return (
      <DropSubNav>
        {renderItem("vertical")}
      </DropSubNav>
    )
  }

  return (
    <SubNav navCollapse={navCollapse}>
      <SubNavTitle>{__(plugin.text)}</SubNavTitle>
      {renderItem("horizontal")}
    </SubNav>
  )

}

export default NavigationItemChild
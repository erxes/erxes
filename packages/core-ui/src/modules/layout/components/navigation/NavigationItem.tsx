import { ChildPlugin, Plugin } from './types';
import { NavIcon, NavItem, NavMenuItem } from '../../styles';
import { getChildren, getLink } from './utils';

import { NavLink } from 'react-router-dom';
import NavigationItemChildren from './NavigationItemChildren';
import React from 'react';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import { customNavigationLabel } from 'pluginUtils';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  plugin: Plugin;
  navCollapse: number;
  showMenu?: boolean;
  clickedMenu?: string;
  toggleMenu?: (text: string) => void;
};

export default function NavigationItem(props: Props) {
  const { plugin, navCollapse, showMenu, clickedMenu, toggleMenu } = props;

  const children: ChildPlugin[] = getChildren(plugin);

  const renderNavIcon = () => {
    if (navCollapse === 1) {
      return <NavIcon className={plugin.icon} />;
    }

    return (
      <>
        <NavIcon className={plugin.icon} />
        <label>{__(plugin.text)}</label>
      </>
    );
  };

  const navMenuItemNode = (
    <NavMenuItem isMoreItem={false} navCollapse={navCollapse}>
      <NavLink
        to={getLink(plugin.url)}
        onClick={() => toggleMenu && toggleMenu(plugin.text)}
      >
        {renderNavIcon()}

        {plugin.url.includes('inbox') && isEnabled('inbox')
          ? customNavigationLabel()
          : plugin.label}
      </NavLink>
    </NavMenuItem>
  );

  const renderNavMenuItem = () => {
    if (children.length === 0 && plugin.text !== 'Settings')
      return (
        <Tip placement="right" key={Math.random()} text={__(plugin.text)}>
          {navMenuItemNode}
        </Tip>
      );

    return navMenuItemNode;
  };

  const renderItem = () => {
    return (
      <NavItem isMoreItem={false}>
        {renderNavMenuItem()}

        <NavigationItemChildren
          plugin={plugin}
          children={children}
          navCollapse={navCollapse}
          showMenu={showMenu}
          clickedMenu={clickedMenu}
        />
      </NavItem>
    );
  };

  if (plugin.text === 'Settings') {
    return <React.Fragment key={plugin.url}>{renderItem()}</React.Fragment>;
  }

  return (
    <WithPermission
      key={plugin.url}
      action={plugin.permission ? plugin.permission : ''}
      actions={plugin.permissions ? plugin.permissions : []}
    >
      {renderItem()}
    </WithPermission>
  );
}

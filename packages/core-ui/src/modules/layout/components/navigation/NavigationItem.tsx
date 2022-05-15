import React from "react";
import { NavLink } from "react-router-dom";

import { NavItem, NavMenuItem, NavIcon } from "../../styles";

import WithPermission from "modules/common/components/WithPermission";
import Tip from "modules/common/components/Tip";
import Label from "modules/common/components/Label";
import { __ } from "modules/common/utils";

import { isEnabled } from "@erxes/ui/src/utils/core";

import NavigationItemChildren from "./NavigationItemChildren";

import { getLink, getChildren } from "./utils";
import { Plugin, ChildPlugin } from "./types";

type Props = {
  plugin: Plugin;
  navCollapse: number;
  showMenu?: boolean;
  clickedMenu?: string;
  toggleMenu?: (text: string) => void;
  unreadConversationsCount?: number;
};

export default function NavigationItem(props: Props) {
  const {
    plugin,
    navCollapse,
    showMenu,
    clickedMenu,
    toggleMenu,
    unreadConversationsCount,
  } = props;

  const children: ChildPlugin[] = getChildren(plugin);

  const unreadIndicator = unreadConversationsCount !== 0 && (
    <Label shake={true} lblStyle="danger" ignoreTrans={true}>
      {unreadConversationsCount}
    </Label>
  );

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

        {plugin.url.includes("inbox") && isEnabled("inbox")
          ? unreadIndicator
          : plugin.label}
      </NavLink>
    </NavMenuItem>
  );

  const renderNavMenuItem = () => {
    if (children.length === 0 && plugin.text !== "Settings")
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

  if (plugin.text === "Settings") {
    return <React.Fragment key={plugin.url}>{renderItem()}</React.Fragment>;
  }

  return (
    <WithPermission
      key={plugin.url}
      action={plugin.permission ? plugin.permission : ""}
      actions={plugin.permissions ? plugin.permissions : []}
    >
      {renderItem()}
    </WithPermission>
  );
}

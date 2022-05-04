import React from "react";
import { NavLink } from "react-router-dom";
import {
  SubNav,
  SubNavTitle,
  SubNavItem,
  DropSubNav,
  DropSubNavItem,
} from "../../styles"

import WithPermission from "modules/common/components/WithPermission";
import { __ } from "modules/common/utils"

import { getLink } from "./utils";
import { Plugin, ChildPlugin } from "./types";

type Props = {
  plugin: Plugin,
  children: ChildPlugin[],
  navCollapse: number,
  showMenu?: boolean,
  clickedMenu?: string
}

export default function NavigationChildList(props: Props) {
  const {
    plugin,
    children,
    navCollapse,
    showMenu,
    clickedMenu
  } = props;

  const renderChildren = (type: string) => {
    return children.map((child: ChildPlugin, index: number) => {
      const link = (
        <NavLink to={getLink(child.to)}>{__(child.text)}</NavLink>
      );
  
      return (
        <WithPermission key={index} action={child.permission}>
          {type === "horizontal"
            ? <DropSubNavItem>{link}</DropSubNavItem>
            : (
              <SubNavItem additional={child.additional || false}>
                {link}
              </SubNavItem>
            )
          }
        </WithPermission>
      )
    })
  };

  if (children.length === 0)
    return <></>
  
  if (
    navCollapse === 3 &&
    clickedMenu === plugin.text &&
    showMenu
  ) {
    return (
      <DropSubNav>
        {renderChildren("vertical")}
      </DropSubNav>
    )
  } else {
    return (
        <SubNav navCollapse={navCollapse}>
          <SubNavTitle>{__(plugin.text)}</SubNavTitle>
          {renderChildren("horizontal")}
        </SubNav>
    )
  }
}
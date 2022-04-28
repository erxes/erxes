import WithPermission from "modules/common/components/WithPermission";
import { __ } from "modules/common/utils";
import { pluginNavigations } from "pluginUtils";
import React from "react";
// import { NavLink } from "react-router-dom";
import {
  // LeftNavigation,
  // NavIcon,
  // Nav,
  // SubNav,
  // SubNavTitle,
  NavItem,
  // SubNavItem,
  // MoreMenuWrapper,
  // MoreSearch,
  MoreItemRecent,
  // MoreMenus,
  // MoreTitle,
  // NavMenuItem,
  // FlexBox,
  // CollapseBox,
  // SmallText,
  // DropSubNav,
  // DropSubNavItem,
  // Center,
  RoundBox,
  // BottomMenu,
} from "../../styles";
// import { getThemeItem } from "utils";
// import Icon from "modules/common/components/Icon";
// import FormControl from "modules/common/components/form/Control";
// import Label from "modules/common/components/Label";
// import { isEnabled } from "@erxes/ui/src/utils/core";
import Tip from "modules/common/components/Tip";
import { ISubNav } from ".";
import Item from "./Item";

type Props = {
  navCollapse: number;
  permission: string;
  pinnedNavigations: any[];
  countOfPinnedNavigation: number;
  text: string;
  url: string;
  icon?: string;
  name?: string;
  childrens?: ISubNav[];
  label?: React.ReactNode;
  isMoreItem?: boolean;
  isPinned?: boolean;
};

type State = {
  pinnedNavigations: any[];
  countOfPinnedNavigation: number;
};

class MenuItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      pinnedNavigations: props.pinnedNavigations,
      countOfPinnedNavigation: props.countOfPinnedNavigation,
    };
  }

  onClickPin = (pinnedPlugin: any) => {
    this.setState(
      (prevState) => ({
        pinnedNavigations: [...prevState.pinnedNavigations, pinnedPlugin],
      }),
      () => {
        localStorage.setItem(
          "pinnedPlugins",
          JSON.stringify(this.state.pinnedNavigations)
        );
      }
    );
  };

  unPin = (selectPluginName: string) => {
    this.setState(
      {
        pinnedNavigations: this.state.pinnedNavigations.filter(
          (plugin) => plugin.text !== selectPluginName
        ),
      },
      () => {
        localStorage.setItem(
          "pinnedPlugins",
          JSON.stringify(this.state.pinnedNavigations)
        );
      }
    );
  };

  render() {
    const {
      navCollapse,
      permission,
      text,
      url,
      icon,
      // name,
      childrens,
      label,
      isMoreItem,
      isPinned,
    } = this.props;
    const { countOfPinnedNavigation, pinnedNavigations } = this.state;

    const hasChild =
      childrens &&
      childrens.find((child) =>
        child.scope === "cards"
          ? child.text.toLowerCase().includes(text.toLowerCase())
          : text.toLowerCase().includes(child.scope)
      );

    const onClickPin = () =>
      !isPinned
        ? this.onClickPin(
            pluginNavigations().find((plugin) => plugin.text === text)
          )
        : this.unPin(text);

    const limitExceeded = pinnedNavigations.length >= countOfPinnedNavigation;
    const showPin = limitExceeded ? (isPinned ? true : false) : true;

    const item = (
      // <div ref={this.setWrapperRef}>
      <div>
        <NavItem isMoreItem={isMoreItem}>
          <Item
            navCollapse={navCollapse}
            icon={icon}
            url={url}
            text={text}
            label={label}
            isMoreItem={isMoreItem}
          />

          {isMoreItem && showPin && (
            <Tip
              placement="top"
              text={isPinned ? __("Unpin plugin") : __("Pin plugin")}
            >
              <RoundBox pinned={isPinned} onClick={onClickPin}>
                <img src="/images/pin.svg" alt="pin" />
              </RoundBox>
            </Tip>
          )}

          {/* {!isMoreItem &&
            hasChild &&
            this.renderChildren(url, text, childrens, name, navCollapse)} */}
        </NavItem>
      </div>
    );

    if (
      (!isMoreItem && !hasChild) ||
      ((!childrens || childrens.length === 0) && !isMoreItem)
    ) {
      return (
        <WithPermission key={url} action={permission}>
          <Tip placement="right" key={Math.random()} text={__(text)}>
            {item}
          </Tip>
        </WithPermission>
      );
    }

    return (
      <WithPermission key={url} action={permission}>
        {!isMoreItem ? item : <MoreItemRecent>{item}</MoreItemRecent>}
      </WithPermission>
    );
  }
}

export default MenuItem;

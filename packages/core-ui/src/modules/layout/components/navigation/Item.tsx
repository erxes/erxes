// import WithPermission from "modules/common/components/WithPermission";
import { __ } from "modules/common/utils";
// import { pluginNavigations } from "pluginUtils";
import React from "react";
import { NavLink } from "react-router-dom";
import {
  // LeftNavigation,
  NavIcon,
  // Nav,
  // SubNav,
  // SubNavTitle,
  // NavItem,
  // SubNavItem,
  // MoreMenuWrapper,
  // MoreSearch,
  // MoreItemRecent,
  // MoreMenus,
  // MoreTitle,
  NavMenuItem,
  // FlexBox,
  // CollapseBox,
  // SmallText,
  // DropSubNav,
  // DropSubNavItem,
  // Center,
  // RoundBox,
  // BottomMenu,
} from "../../styles";
// import { getThemeItem } from "utils";
// import Icon from "modules/common/components/Icon";
// import FormControl from "modules/common/components/form/Control";
// import Label from "modules/common/components/Label";
// import { isEnabled } from "@erxes/ui/src/utils/core";
import { getLink } from "./utils";
// import Tip from "modules/common/components/Tip";
// import { ISubNav } from ".";

type Props = {
  navCollapse: number;
  text: string;
  url: string;
  icon?: string;
  name?: string;
  label?: React.ReactNode;
  isMoreItem?: boolean;
};

type State = {
  pinnedNavigations: any[];
  countOfPinnedNavigation: number;
};

class Item extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      pinnedNavigations: props.pinnedNavigations,
      countOfPinnedNavigation: props.countOfPinnedNavigation,
    };
  }

  renderHandleNavItem(info) {
    const { icon, text, isMoreItem } = info;
    const { navCollapse } = this.props;

    if (navCollapse === 1 && !isMoreItem) {
      return <NavIcon className={icon} />;
    }

    return (
      <>
        <NavIcon className={icon} />
        <label>{text}</label>
      </>
    );
  }

  render() {
    const { icon, text, url, isMoreItem } = this.props;
    // const { unreadConversationsCount, navCollapse } = this.props;
    // const { clickedMenu, showMenu } = this.state;

    // const unreadIndicator = unreadConversationsCount !== 0 && (
    //   <Label shake={true} lblStyle="danger" ignoreTrans={true}>
    //     {unreadConversationsCount}
    //   </Label>
    // );

    return (
      <NavMenuItem
        isMoreItem={isMoreItem}
        // navCollapse={navCollapse}
      >
        <NavLink
          to={getLink(url)}
          // onClick={() => {
          //   if (clickedMenu === text && clickedMenu !== "more") {
          //     return this.setState({
          //       showMenu: !showMenu,
          //       clickedMenu: text,
          //     });
          //   }
          //   this.setState({ showMenu: true, clickedMenu: text });
          // }}
        >
          {this.renderHandleNavItem({
            icon: icon,
            text: text,
            isMoreItem: isMoreItem,
          })}

          {/* {url.includes("inbox") && isEnabled("inbox")
            ? unreadIndicator
            : label} */}
        </NavLink>
      </NavMenuItem>
    );
  }
}

export default Item;

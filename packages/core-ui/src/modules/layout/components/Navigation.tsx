import WithPermission from "modules/common/components/WithPermission";
import { __, readFile, setBadge } from "modules/common/utils";
import { pluginNavigations } from "pluginUtils";
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LeftNavigation,
  NavIcon,
  Nav,
  SubNav,
  NavItem,
  SubNavItem,
  MoreMenuWrapper,
  MoreSearch,
  MoreItemRecent,
  MoreMenus,
  MoreTitle,
  NavMenuItem,
  FlexBox,
  CollapseBox,
  SmallText,
} from "../styles";
import { getThemeItem } from "utils";
import Icon from "modules/common/components/Icon";
import FormControl from "modules/common/components/form/Control";
import Label from "modules/common/components/Label";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { Flex } from "@erxes/ui/src/styles/main";

export interface ISubNav {
  permission: string;
  link: string;
  value: string;
  icon: string;
  additional?: boolean;
}

type State = {
  showMenu: boolean;
  moreMenus: any[];
  searchText: string;
  navCollapse: number;
};

class Navigation extends React.Component<
  { unreadConversationsCount?: number },
  State
> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
      moreMenus: pluginNavigations().slice(4) || [],
      searchText: "",
      navCollapse: 2,
    };
  }

  componentWillReceiveProps(nextProps) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __("Team Inbox").toString());
    }
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  getLink = (url) => {
    const storageValue = window.localStorage.getItem("pagination:perPage");

    let parsedStorageValue;

    try {
      parsedStorageValue = JSON.parse(storageValue || "");
    } catch {
      parsedStorageValue = {};
    }

    if (url.includes("?")) {
      const pathname = url.split("?")[0];

      if (!url.includes("perPage") && parsedStorageValue[pathname]) {
        return `${url}&perPage=${parsedStorageValue[pathname]}`;
      }
      return url;
    }

    if (parsedStorageValue[url]) {
      return `${url}?perPage=${parsedStorageValue[url]}`;
    }

    return url;
  };

  onSearch = (value: string) => {
    const filteredValue = (val) => val.text.toLowerCase().includes(value);

    this.setState({
      moreMenus: pluginNavigations()
        .slice(4)
        .filter(filteredValue),
    });
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showMenu: false });
    }
  };

  onClickHandleIcon = (type: string) => {
    this.setState({
      navCollapse:
        type === "plus"
          ? this.state.navCollapse + 1
          : this.state.navCollapse - 1,
    });
  };

  onClickMore = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  renderSubNavItem = (child, index: number) => {
    return (
      <WithPermission key={index} action={child.permission}>
        <SubNavItem additional={child.additional || false}>
          <NavLink to={this.getLink(child.link)}>
            <i className={child.icon} />
            {__(child.value)}
          </NavLink>
        </SubNavItem>
      </WithPermission>
    );
  };

  renderChildren(url: string, text: string, childrens?: ISubNav[]) {
    if (!childrens || childrens.length === 0) {
      return null;
    }

    return (
      <SubNav>
        {childrens.map((child, index) => this.renderSubNavItem(child, index))}
      </SubNav>
    );
  }

  renderNavHandleIcon() {
    switch (this.state.navCollapse) {
      case 1:
        return this.renderHandleIcon("plus");
      case 3:
        return (
          <Flex>
            <SmallText>Collapse</SmallText>
            {this.renderHandleIcon("minus")}
          </Flex>
        );
      default:
        return (
          <>
            {this.renderHandleIcon("minus")}
            {this.renderHandleIcon("plus")}
          </>
        );
    }
  }

  renderHandleIcon(type: string) {
    return (
      <CollapseBox onClick={() => this.onClickHandleIcon(type)}>
        <Icon icon={type} />
      </CollapseBox>
    );
  }

  renderHandleNavItem(info) {
    const { icon, text } = info;

    if (this.state.navCollapse === 1) {
      return <NavIcon className={icon} />;
    } else {
      return (
        <>
          <NavIcon className={icon} />
          <label>{text}</label>
        </>
      );
    }
  }

  renderMenuItem(nav) {
    const { icon, text, url, label } = nav;
    const { unreadConversationsCount } = this.props;

    const unreadIndicator = unreadConversationsCount !== 0 && (
      <Label shake={true} lblStyle="danger" ignoreTrans={true}>
        {unreadConversationsCount}
      </Label>
    );

    return (
      <NavMenuItem navCollapse={this.state.navCollapse}>
        <NavLink
          to={this.getLink(url)}
          onClick={() => this.setState({ showMenu: false })}
        >
          {this.renderHandleNavItem({ icon: icon, text: text })}

          {url.includes("inbox") && isEnabled("inbox")
            ? unreadIndicator
            : label}
        </NavLink>
      </NavMenuItem>
    );
  }

  renderNavItem = (
    permission: string,
    text: string,
    url: string,
    icon?: string,
    childrens?: ISubNav[],
    label?: React.ReactNode
  ) => {
    const item = (
      <NavItem>
        {this.renderMenuItem({ icon, url, text, label })}
        {this.renderChildren(url, text, childrens)}
      </NavItem>
    );

    if (!childrens || childrens.length === 0) {
      return (
        <WithPermission key={url} action={permission}>
          {item}
        </WithPermission>
      );
    }

    return (
      <WithPermission key={url} action={permission}>
        {item}
      </WithPermission>
    );
  };

  renderMorePlugins = () => {
    const { showMenu, moreMenus } = this.state;

    return (
      <MoreMenuWrapper visible={showMenu}>
        <MoreSearch>
          <Icon icon="search-1" size={15} />
          <FormControl
            onChange={(e: any) =>
              this.onSearch(e.target.value.trim().toLowerCase())
            }
            type="text"
            placeholder="Find plugins"
          />
        </MoreSearch>
        <MoreTitle>{__("Other added plugins")}</MoreTitle>
        <MoreMenus>
          {moreMenus.map((menu, index) => (
            <MoreItemRecent key={index}>
              {this.renderNavItem(
                menu.permission,
                menu.text,
                menu.url,
                menu.icon
              )}
            </MoreItemRecent>
          ))}
        </MoreMenus>
      </MoreMenuWrapper>
    );
  };

  renderMore = () => {
    if (pluginNavigations().length <= 4) {
      return null;
    }

    return (
      <div ref={this.setWrapperRef}>
        <NavItem>
          <NavMenuItem navCollapse={this.state.navCollapse}>
            <a onClick={() => this.onClickMore()}>
              {this.renderHandleNavItem({
                icon: "icon-ellipsis-h",
                text: "More",
              })}
            </a>
          </NavMenuItem>

          {this.renderMorePlugins()}
        </NavItem>
      </div>
    );
  };

  render() {
    const Navs = pluginNavigations().slice(0, 4);
    const logo =
      this.state.navCollapse === 1 ? "glyph_dark.png" : "logo-dark.png";
    const thLogo = getThemeItem("logo");

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img
            src={thLogo ? readFile(thLogo) : `/images/${logo}`}
            alt="erxes"
          />
        </NavLink>

        <FlexBox navCollapse={this.state.navCollapse}>
          {this.renderNavHandleIcon()}
        </FlexBox>

        <Nav id="navigation">
          {Navs.map((nav) =>
            this.renderNavItem(
              nav.permission,
              nav.text,
              nav.url,
              nav.icon,
              nav.childrens || [],
              nav.label
            )
          )}

          {this.renderMenuItem({
            text: "Settings",
            url: "/settings",
            icon: "icon-settings",
          })}

          {this.renderMore()}
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;

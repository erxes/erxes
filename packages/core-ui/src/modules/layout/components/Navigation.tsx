import WithPermission from "modules/common/components/WithPermission";
import { __, readFile, setBadge } from "modules/common/utils";
import { pluginNavigations, pluginRouters } from "pluginUtils";
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LeftNavigation,
  NavIcon,
  Nav,
  SubNav,
  SubNavTitle,
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
  DropSubNav,
  DropSubNavItem,
} from "../styles";
import { getThemeItem } from "utils";
import Icon from "modules/common/components/Icon";
import FormControl from "modules/common/components/form/Control";
import Label from "modules/common/components/Label";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { Flex } from "@erxes/ui/src/styles/main";
import Tip from "modules/common/components/Tip";

export interface ISubNav {
  permission: string;
  to: string;
  text: string;
  scope: string;
}

type Props = {
  unreadConversationsCount?: number;
  navCollapse: number;
  onClickHandleIcon: (e) => void;
};

type State = {
  showMenu: boolean;
  moreMenus: any[];
  searchText: string;
  clickedMenu: string;
};

class Navigation extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
      moreMenus: pluginNavigations().slice(4) || [],
      searchText: "",
      clickedMenu: "",
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

  onClickMore = () => {
    if (this.state.clickedMenu === "more") {
      return this.setState({
        showMenu: !this.state.showMenu,
        clickedMenu: "more",
      });
    }
    this.setState({ showMenu: true, clickedMenu: "more" });
  };

  renderSubNavItem = (child, index: number) => {
    // console.log(child, "holaaaa")
    return (
      // <WithPermission key={index} action={child.permission}>
      <SubNavItem additional={child.additional || false}>
        <Icon icon="corner-down-right-alt" />
        <NavLink to={this.getLink(child.to)}>{__(child.text)}</NavLink>
      </SubNavItem>
      // </WithPermission>
    );
  };

  renderChildren(
    url: string,
    text: string,
    childrens?: ISubNav[],
    navCollapse?: number
  ) {
    const { showMenu, clickedMenu } = this.state;
    if (!childrens || childrens.length === 0) {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const parent = urlParams.get("parent");

    if (
      navCollapse === 3 &&
      clickedMenu === text &&
      (parent === url || window.location.pathname.startsWith(url))
    ) {
      return (
        <DropSubNav>
          {childrens.map((child, index) => (
            <DropSubNavItem>
              {/* <WithPermission key={index} action={child.permission}> */}
              <Icon icon="corner-down-right-alt" />
              <NavLink to={this.getLink(`${child.to}?parent=${url}`)}>
                {__(child.text)}
              </NavLink>
              {/* </WithPermission> */}
            </DropSubNavItem>
          ))}
        </DropSubNav>
      );
    }

    return (
      <SubNav visible={showMenu} navCollapse={this.props.navCollapse}>
        {/* {!collapsed && <SubNavTitle>{__(text)}</SubNavTitle>} */}
        <SubNavTitle>{__(text)}</SubNavTitle>
        {childrens.map((child, index) => this.renderSubNavItem(child, index))}
      </SubNav>
    );
  }

  renderNavHandleIcon() {
    switch (this.props.navCollapse) {
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
      <CollapseBox
        onClick={() => {
          this.props.onClickHandleIcon(type);
          this.setState({
            showMenu: false,
          });
        }}
      >
        <Icon icon={type} />
      </CollapseBox>
    );
  }

  renderHandleNavItem(info) {
    const { icon, text, childrens, isMoreItem } = info;
    const collapseIcon = this.state.showMenu ? "angle-down" : "angle-up";

    if (isMoreItem)
      return (
        <>
          <NavIcon className={icon} />
          <label>{text}</label>
        </>
      );

    switch (this.props.navCollapse) {
      case 1:
        return <NavIcon className={icon} />;
      case 3:
        return (
          <>
            <NavIcon className={icon} />
            <label>{text}</label>

            {/* {childrens && <Icon icon={collapseIcon} />} */}
          </>
        );
      default:
        return (
          <>
            <NavIcon className={icon} />
            <label>{text}</label>
          </>
        );
    }
  }

  renderMenuItem(nav) {
    const { icon, text, url, label, childrens, isMoreItem } = nav;
    const { unreadConversationsCount } = this.props;

    const unreadIndicator = unreadConversationsCount !== 0 && (
      <Label shake={true} lblStyle="danger" ignoreTrans={true}>
        {unreadConversationsCount}
      </Label>
    );

    return (
      <NavMenuItem isMoreItem={isMoreItem} navCollapse={this.props.navCollapse}>
        <NavLink
          to={this.getLink(url)}
          onClick={() => {
            if (this.state.clickedMenu === text) {
              return this.setState({
                showMenu: !this.state.showMenu,
                clickedMenu: text,
              });
            }
            this.setState({ showMenu: true, clickedMenu: text });
          }}
        >
          {this.renderHandleNavItem({
            icon: icon,
            text: text,
            childrens: childrens,
            isMoreItem: isMoreItem,
          })}

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
    label?: React.ReactNode,
    isMoreItem?: boolean
  ) => {
    const { navCollapse } = this.props;

    const item = (
      <div ref={this.setWrapperRef}>
        <NavItem>
          {this.renderMenuItem({ icon, url, text, label, childrens, isMoreItem })}
          {this.renderChildren(url, text, childrens, navCollapse)}
        </NavItem>
      </div>
    );

    if (!childrens || childrens.length === 0) {
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
  };

  renderMorePlugins = () => {
    const { showMenu, moreMenus } = this.state;

    return (
      <MoreMenuWrapper visible={showMenu} navCollapse={this.props.navCollapse}>
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
          {moreMenus.map((menu) =>
            this.renderNavItem(
              menu.permission,
              menu.text,
              menu.url,
              menu.icon,
              [],
              "",
              true
            )
          )}
        </MoreMenus>
      </MoreMenuWrapper>
    );
  };

  renderMore = () => {
    const text = this.props.navCollapse === 3 ? "More plugins" : "More";
    if (pluginNavigations().length <= 4) {
      return null;
    }

    return (
      <div ref={this.setWrapperRef}>
        <NavItem>
          <NavMenuItem navCollapse={this.props.navCollapse}>
            <a onClick={() => this.onClickMore()}>
              {this.renderHandleNavItem({
                icon: "icon-ellipsis-h",
                text: {text},
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
      this.props.navCollapse === 1 ? "glyph_dark.png" : "logo-dark.png";
    const thLogo = getThemeItem("logo");

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img
            src={thLogo ? readFile(thLogo) : `/images/${logo}`}
            alt="erxes"
          />
        </NavLink>

        <FlexBox navCollapse={this.props.navCollapse}>
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

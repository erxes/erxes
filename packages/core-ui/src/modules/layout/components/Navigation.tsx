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
  Center,
  RoundBox,
} from "../styles";
import { getThemeItem } from "utils";
import Icon from "modules/common/components/Icon";
import FormControl from "modules/common/components/form/Control";
import Label from "modules/common/components/Label";
import { isEnabled } from "@erxes/ui/src/utils/core";
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
  pinned: boolean;
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
      pinned: false,
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
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.state.clickedMenu === "more"
    ) {
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

  onClickPin = () => {
    this.setState({ pinned: !this.state.pinned });
  };

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

  renderNavHandleIcon() {
    switch (this.props.navCollapse) {
      case 1:
        return this.renderHandleIcon("plus");
      case 3:
        return (
          <Center>
            <SmallText>Collapse</SmallText>
            {this.renderHandleIcon("minus")}
          </Center>
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

  renderMenuItem(nav) {
    const { icon, text, url, label, isMoreItem } = nav;
    const { unreadConversationsCount, navCollapse } = this.props;
    const { clickedMenu, showMenu } = this.state;

    const unreadIndicator = unreadConversationsCount !== 0 && (
      <Label shake={true} lblStyle="danger" ignoreTrans={true}>
        {unreadConversationsCount}
      </Label>
    );

    return (
      <NavMenuItem isMoreItem={isMoreItem} navCollapse={navCollapse}>
        <NavLink
          to={this.getLink(url)}
          onClick={() => {
            if (clickedMenu === text && clickedMenu !== "more") {
              return this.setState({
                showMenu: !showMenu,
                clickedMenu: text,
              });
            }
            this.setState({ showMenu: true, clickedMenu: text });
          }}
        >
          {this.renderHandleNavItem({
            icon: icon,
            text: text,
            isMoreItem: isMoreItem,
          })}

          {url.includes("inbox") && isEnabled("inbox")
            ? unreadIndicator
            : label}
        </NavLink>
      </NavMenuItem>
    );
  }

  renderSubNavItem = (child, type: string, name?: string) => {
    if (name && child.scope !== name) {
      return null;
    }

    const link = (
      <NavLink to={this.getLink(child.to)}>{__(child.text)}</NavLink>
    );

    if (type === "vertical") {
      return <DropSubNavItem>{link}</DropSubNavItem>;
    }

    return (
      <SubNavItem additional={child.additional || false}>{link}</SubNavItem>
    );
  };

  renderChildren(
    url: string,
    text: string,
    childrens?: ISubNav[],
    name?: string,
    navCollapse?: number
  ) {
    const { showMenu, clickedMenu } = this.state;
    if (!childrens || childrens.length === 0) {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const parent = urlParams.get("parent");

    const renderItem = (type: string) => {
      return childrens.map((child, index) => (
        <WithPermission key={index} action={child.permission}>
          {this.renderSubNavItem(child, type, name)}
        </WithPermission>
      ));
    };

    if (
      navCollapse === 3 &&
      clickedMenu === text &&
      showMenu === true &&
      (parent === url || window.location.pathname.startsWith(url))
    ) {
      return <DropSubNav>{renderItem("vertical")}</DropSubNav>;
    }

    return (
      <SubNav navCollapse={this.props.navCollapse}>
        <SubNavTitle>{__(text)}</SubNavTitle>
        {renderItem("horizontal")}
      </SubNav>
    );
  }

  renderNavItem = (
    permission: string,
    text: string,
    url: string,
    icon?: string,
    name?: string,
    childrens?: ISubNav[],
    label?: React.ReactNode,
    isMoreItem?: boolean
  ) => {
    const { navCollapse } = this.props;
    const hasChild =
      childrens && childrens.find((child) => child.scope === name);

    const item = (
      <div ref={this.setWrapperRef}>
        <NavItem isMoreItem={isMoreItem}>
          {this.renderMenuItem({
            icon,
            url,
            text,
            label,
            isMoreItem,
          })}

          {isMoreItem && (
            <RoundBox
              pinned={this.state.pinned}
              onClick={() => this.onClickPin()}
            >
              <Icon icon="clip" />
            </RoundBox>
          )}

          {!isMoreItem &&
            hasChild &&
            this.renderChildren(url, text, childrens, name, navCollapse)}
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
  };

  renderMorePlugins = () => {
    const { showMenu, moreMenus, clickedMenu } = this.state;

    if (clickedMenu === "more") {
      return (
        <div ref={this.setWrapperRef}>
          <MoreMenuWrapper
            visible={showMenu}
            navCollapse={this.props.navCollapse}
          >
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
                  "",
                  [],
                  "",
                  true
                )
              )}
            </MoreMenus>
          </MoreMenuWrapper>
        </div>
      );
    }

    return null;
  };

  renderMore = () => {
    const { navCollapse } = this.props;
    const text = navCollapse === 3 ? "More plugins" : "More";

    if (pluginNavigations().length <= 4) {
      return null;
    }
    return (
      <div ref={this.setWrapperRef}>
        <NavItem>
          <NavMenuItem navCollapse={navCollapse}>
            <a onClick={() => this.onClickMore()}>
              {this.renderHandleNavItem({
                icon: "icon-ellipsis-h",
                text: text,
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
              nav.name || "",
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

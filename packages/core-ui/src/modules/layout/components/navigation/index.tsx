import React from "react"
import { NavLink } from "react-router-dom"

import {
  LeftNavigation,
  FlexBox,
  BottomMenu,
} from "../../styles";

import { __, readFile, setBadge } from "modules/common/utils"

import NavigationToggler from "./NavigationToggler";
import NavigationList from "./NavigationList";
import NavigationItem from "./NavigationItem";

import { Plugin } from "./types";
import { getThemeItem } from "utils";

type Props = {
  unreadConversationsCount?: number;
  navCollapse: number;
  onClickHandleIcon: (event) => void;
}

type State = {
  pinnedPlugins: Plugin[];
  countOfPinnedPlugins: number;
}

export default class Navigation extends React.Component<Props, State> {
  constructor(props: Props){
    super(props)
    
    this.state = {
      pinnedPlugins: JSON.parse(
        localStorage.getItem("pinnedPlugins") || "[]"
      ),
      countOfPinnedPlugins: window.innerHeight > 900 ? 8 : 5
    }
  }

  componentWillReceiveProps(nextProps: any) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __("Team Inbox").toString());
    }
  }

  updatePinnedPlugins = (plugins: Plugin[]): void => {
    this.setState({ pinnedPlugins: plugins })

    localStorage.setItem(
      "pinnedPlugins",
      JSON.stringify(plugins)
    );
  }

  render() {
    const {
      unreadConversationsCount,
      navCollapse,
      onClickHandleIcon
    } = this.props
    
    const {
      pinnedPlugins,
      countOfPinnedPlugins
    } = this.state

    const generateLogoSource = (): string => {
      const logo = this.props.navCollapse === 1 ? "glyph_dark.png" : "logo-dark.png"
      const thLogo = getThemeItem("logo");
      
      return thLogo ? readFile(thLogo) : `/images/${logo}`
    }

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img
            src={generateLogoSource()}
            alt="erxes"
          />
        </NavLink>

        <FlexBox navCollapse={navCollapse}>
          <NavigationToggler
            navCollapse={navCollapse}
            onClickHandleIcon={onClickHandleIcon}
          />
        </FlexBox>

        <NavigationList
          navCollapse={navCollapse}
          pinnedPlugins={pinnedPlugins}
          countOfPinnedPlugins={countOfPinnedPlugins}
          updatePinnedPlugins={this.updatePinnedPlugins}
          unreadConversationsCount={unreadConversationsCount}
        />

        <BottomMenu>
          <NavigationItem
            plugin={{
              text: "Settings",
              url: "/settings",
              icon: "icon-settings"
            }}
            navCollapse={navCollapse}
          />
        </BottomMenu>

      </LeftNavigation>
    )
  }
}
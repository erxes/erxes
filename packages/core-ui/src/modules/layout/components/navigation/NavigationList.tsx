import { Navigate, Route, Routes } from "react-router-dom";

import { Nav } from "../../styles";
import NavigationItem from "./NavigationItem";
import NavigationMore from "./NavigationMore";
import { Plugin } from "./types";
import React from "react";
import { pluginNavigations } from "./utils";

type Props = {
  navCollapse: number;
};

type State = {
  showMenu: boolean;
  clickedMenu: string;
  pinnedPlugins: Plugin[];
  countOfPinnedPlugins: number;
};

const CORE_PLUGINS = [
  {
    text: "Contacts",
    url: "/contacts/customer",
    icon: "icon-user",
    location: "mainNavigation",
    permission: "showCustomers"
  },
  {
    text: "Segments",
    url: "/segments",
    icon: "icon-chart-pie-alt",
    location: "mainNavigation",
    permission: "showSegments"
  },
  {
    text: "Forms",
    url: "/forms",
    icon: "icon-laptop",
    location: "mainNavigation",
    permission: "showForms"
  },
  {
    text: "Insight",
    url: "/insight",
    icon: "icon-reload",
    location: "mainNavigation"
  }
];

export default class NavigationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showMenu: false,
      clickedMenu: "",
      pinnedPlugins: JSON.parse(localStorage.getItem("pinnedPlugins") || "[]"),
      countOfPinnedPlugins: window.innerHeight > 900 ? 7 : 5
    };
  }

  toggleMenu = (text: string): void => {
    if (this.state.clickedMenu === text) {
      this.setState({ showMenu: !this.state.showMenu });
    } else {
      this.setState({ showMenu: true, clickedMenu: text });
    }
  };

  updatePinnedPlugins = (plugins: Plugin[]): void => {
    this.setState({ pinnedPlugins: plugins });

    localStorage.setItem("pinnedPlugins", JSON.stringify(plugins));
  };

  render() {
    const { navCollapse } = this.props;

    const { showMenu, clickedMenu, pinnedPlugins, countOfPinnedPlugins } =
      this.state;

    const plugins =
      pinnedPlugins.length === 0
        ? pluginNavigations().slice(0, countOfPinnedPlugins)
        : pinnedPlugins;

    const index = () => {
      if (plugins.length !== 0) {
        return <Navigate replace to={`${plugins[0].url}`} />;
      }

      return <Navigate replace to={`/welcome`} />;
    };

    return (
      <>
        <Routes>
          <Route path="/" key="root" element={index()} />
        </Routes>
        <Nav id="navigation">
          {plugins.map((plugin: Plugin, i: number) => (
            <NavigationItem
              key={i}
              plugin={plugin}
              navCollapse={navCollapse}
              showMenu={showMenu}
              clickedMenu={clickedMenu}
              toggleMenu={this.toggleMenu}
            />
          ))}

          {pluginNavigations().length > countOfPinnedPlugins && (
            <NavigationMore
              navCollapse={navCollapse}
              showMenu={showMenu}
              clickedMenu={clickedMenu}
              pinnedPlugins={pinnedPlugins}
              countOfPinnedPlugins={countOfPinnedPlugins}
              toggleMenu={this.toggleMenu}
              updatePinnedPlugins={this.updatePinnedPlugins}
            />
          )}
        </Nav>
      </>
    );
  }
}

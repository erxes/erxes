import React from 'react';
import { Nav } from '../../styles';

import NavigationItem from './NavigationItem';
import NavigationMore from './NavigationMore';

import { Plugin } from './types';
import { pluginNavigations } from './utils';
import { Redirect, Route } from 'react-router-dom';

type Props = {
  navCollapse: number;
  unreadConversationsCount?: number;
};

type State = {
  showMenu: boolean;
  clickedMenu: string;
  pinnedPlugins: Plugin[];
  countOfPinnedPlugins: number;
};

export default class NavigationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showMenu: false,
      clickedMenu: '',
      pinnedPlugins: JSON.parse(localStorage.getItem('pinnedPlugins') || '[]'),
      countOfPinnedPlugins: window.innerHeight > 900 ? 8 : 5
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

    localStorage.setItem('pinnedPlugins', JSON.stringify(plugins));
  };

  render() {
    const { navCollapse, unreadConversationsCount } = this.props;

    const {
      showMenu,
      clickedMenu,
      pinnedPlugins,
      countOfPinnedPlugins
    } = this.state;

    const plugins =
      pinnedPlugins.length === 0
        ? pluginNavigations().slice(0, countOfPinnedPlugins)
        : pinnedPlugins;

    const index = () => {
      if (plugins.length !== 0) {
        return <Redirect to={`${plugins[0].url}`} />;
      }

      return <Redirect to={`/welcome`} />;
    };
    return (
      <>
        <Route exact={true} path="/" key="root" render={index} />
        <Nav id="navigation">
          {plugins.map((plugin: any, index: number) => (
            <NavigationItem
              key={index}
              plugin={plugin}
              navCollapse={navCollapse}
              showMenu={showMenu}
              clickedMenu={clickedMenu}
              toggleMenu={this.toggleMenu}
              unreadConversationsCount={unreadConversationsCount}
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

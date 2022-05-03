import React from 'react';
import {
  Nav
} from '../../styles';

import NavigationItem from './NavigationItem';
import NavigationMore from './NavigationMore';

import { Plugin } from './types';
import { pluginNavigations } from './utils';

type Props = {
  navCollapse: number;
  pinnedPlugins: any[];
  countOfPinnedPlugins: number;
  updatePinnedPlugins: (plugins: Plugin[]) => void;
};

type State = {
  showMenu: boolean;
  clickedMenu: string;
}

class NavigationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showMenu: false,
      clickedMenu: '',
    }
  }

  private toggleMenu = (text: string) => {
    if (this.state.clickedMenu === text)
      this.setState({ showMenu: !this.state.showMenu })
    else
      this.setState({ showMenu: true, clickedMenu: text })
  }

  public render() {
    const {
      navCollapse,
      pinnedPlugins,
      countOfPinnedPlugins,
      updatePinnedPlugins
    } = this.props;

    const {
      showMenu,
      clickedMenu
    } = this.state;

    const plugins =
      pinnedPlugins.length === 0
        ? pluginNavigations().slice(0, countOfPinnedPlugins)
        : pinnedPlugins;
  
    return (
      <Nav id='navigation'>
        {plugins.map((plugin: any, index: number) => {
          return (
            <NavigationItem
              key={index}
              plugin={plugin}
              navCollapse={navCollapse}
              showMenu={showMenu}
              clickedMenu={clickedMenu}
              toggleMenu={this.toggleMenu}
            />
          )
        })}

        <NavigationMore
          navCollapse={navCollapse}
          showMenu={showMenu}
          clickedMenu={clickedMenu}
          pinnedPlugins={pinnedPlugins}
          countOfPinnedPlugins={countOfPinnedPlugins}
          toggleMenu={this.toggleMenu}
          updatePinnedPlugins={updatePinnedPlugins}
        />
      </Nav>
    )
  }
}

export default NavigationList;

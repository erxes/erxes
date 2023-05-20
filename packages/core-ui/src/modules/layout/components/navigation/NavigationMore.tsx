import React from 'react';

import {
  NavItem,
  NavMenuItem,
  NavIcon,
  MoreMenus,
  MoreMenuWrapper,
  MoreTitle,
  MoreSearch
} from '../../styles';

import Icon from 'modules/common/components/Icon';
import FormControl from 'modules/common/components/form/Control';

import NavigationMoreItem from './NavigationMoreItem';

import { Plugin } from './types';
import { pluginNavigations, filterPlugins } from './utils';

type Props = {
  navCollapse: number;
  showMenu: boolean;
  clickedMenu: string;
  pinnedPlugins: Plugin[];
  countOfPinnedPlugins: number;
  toggleMenu: (text: string) => void;
  updatePinnedPlugins: (plugins: Plugin[]) => void;
};

type State = {
  searchText: string;
  searchedPlugins: Plugin[];
};

export default class NavigationMore extends React.Component<Props, State> {
  wrapperRef: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchText: '',
      searchedPlugins: []
    };
    this.wrapperRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event: any): void => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.current.contains(event.target) &&
      this.props.clickedMenu === 'more'
    ) {
      this.props.toggleMenu('');
    }
  };

  handleSearch = (event: any): void => {
    const otherPlugins: Plugin[] = filterPlugins(
      pluginNavigations(),
      this.props.pinnedPlugins
    );
    const searchedPlugins = otherPlugins.filter((plugin: Plugin) => {
      if (event.target.value !== '')
        return plugin
          .text!.toLowerCase()
          .includes(event.target.value.toLowerCase());
      else return;
    });

    this.setState({
      searchText: event.target.value,
      searchedPlugins: searchedPlugins
    });
  };

  handlePin = (plugin: Plugin): void => {
    if (this.props.pinnedPlugins.length < this.props.countOfPinnedPlugins)
      this.props.updatePinnedPlugins([...this.props.pinnedPlugins, plugin]);
  };

  handleUnpin = (plugin: Plugin): void => {
    this.props.updatePinnedPlugins(
      this.props.pinnedPlugins.filter(
        (item: Plugin) => item.text !== plugin.text
      )
    );
  };

  render() {
    const {
      navCollapse,
      showMenu,
      clickedMenu,
      countOfPinnedPlugins,
      pinnedPlugins,
      toggleMenu
    } = this.props;

    const { searchText, searchedPlugins } = this.state;

    const text = navCollapse === 3 ? 'More plugins' : 'More';

    const otherPlugins =
      searchText !== ''
        ? searchedPlugins
        : pinnedPlugins.length === 0
        ? pluginNavigations().slice(countOfPinnedPlugins)
        : filterPlugins(pluginNavigations(), pinnedPlugins);

    const PinnedPluginsElement = () => (
      <React.Fragment>
        <MoreTitle>Pinned plugins</MoreTitle>
        <MoreMenus>
          {pinnedPlugins.map((plugin: Plugin, index: number) => {
            return (
              <NavigationMoreItem
                key={index}
                plugin={plugin}
                isPinnable={true}
                isPinned={true}
                navCollapse={navCollapse}
                handleOnClick={this.handleUnpin}
                toggleMenu={toggleMenu}
              />
            );
          })}
        </MoreMenus>
      </React.Fragment>
    );

    return (
      <div ref={this.wrapperRef}>
        <NavItem className={`more-${navCollapse}`}>
          <NavMenuItem navCollapse={navCollapse}>
            <a onClick={() => toggleMenu('more')}>
              <NavIcon className="icon-ellipsis-h" />
              {navCollapse !== 1 && <label>{text}</label>}
            </a>
          </NavMenuItem>
          <MoreMenuWrapper
            visible={showMenu && clickedMenu === 'more'}
            navCollapse={this.props.navCollapse}
          >
            <MoreSearch>
              <Icon icon="search-1" size={15} />
              <FormControl
                type="text"
                placeholder="Find plugins"
                value={searchText}
                onChange={this.handleSearch}
              />
            </MoreSearch>
            {pinnedPlugins.length !== 0 && searchText === '' && (
              <PinnedPluginsElement />
            )}
            <MoreTitle>Other added plugins</MoreTitle>
            <MoreMenus>
              {otherPlugins.map((plugin: Plugin, index: number) => {
                return (
                  <NavigationMoreItem
                    key={index}
                    plugin={plugin}
                    isPinnable={pinnedPlugins.length < countOfPinnedPlugins}
                    isPinned={false}
                    navCollapse={navCollapse}
                    handleOnClick={this.handlePin}
                    toggleMenu={toggleMenu}
                  />
                );
              })}
            </MoreMenus>
          </MoreMenuWrapper>
        </NavItem>
      </div>
    );
  }
}

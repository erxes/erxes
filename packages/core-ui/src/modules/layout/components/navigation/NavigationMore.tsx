import React from "react";

import {
  NavItem,
  NavMenuItem,
  NavIcon,
  MoreMenus,
  MoreMenuWrapper,
  MoreItemRecent,
  MoreTitle,
  MoreSearch,
} from '../../styles'

import Icon from "modules/common/components/Icon";
import FormControl from "modules/common/components/form/Control";

import NavigationMoreItem from "./NavigationMoreItem";

import { Plugin } from './types';
import { pluginNavigations, filterPlugins } from "./utils";

type Props = {
  navCollapse: number;
  showMenu: boolean;
  clickedMenu: string;
  pinnedPlugins: Plugin[];
  countOfPinnedPlugins: number;
  toggleMenu: (text: string) => void;
  updatePinnedPlugins: (plugins: Plugin[]) => void;
}

type State = {
  searchText: string;
  searchedPlugins: Plugin[];
}

class NavigationMore extends React.Component<Props, State> {
  wrapperRef: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchText: '',
      searchedPlugins: [],
    };
    this.wrapperRef = React.createRef();
  }

  public componentDidMount() {
    document.addEventListener("click", this.handleClickOutside)
  }

  public componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside)
  }

  private handleClickOutside = (event): void => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.current.contains(event.target) &&
      this.props.clickedMenu === 'more'  
    ) {
      this.props.toggleMenu('')
    }
  }

  private handleSearch = (event): void => {
    const otherPlugins: Plugin[] = filterPlugins(pluginNavigations(), this.props.pinnedPlugins);
    const searchedPlugins = otherPlugins.filter((plugin: Plugin) => {
      if (event.target.value !== '')
        return plugin.text.toLowerCase().includes(event.target.value.toLowerCase())
      else
        return;
    })

    this.setState({
      searchText: event.target.value,
      searchedPlugins: searchedPlugins
    })
  }

  private handlePin = (plugin: Plugin): void => {
    if (this.props.pinnedPlugins.length < this.props.countOfPinnedPlugins)
      this.props.updatePinnedPlugins(
        [...this.props.pinnedPlugins, plugin]
      )
  }

  private handleUnpin = (plugin: Plugin): void => {
    this.props.updatePinnedPlugins(
      this.props.pinnedPlugins.filter(
        (item: Plugin) => item.text !== plugin.text
      )
    )
  }

  public render() {
    const {
      navCollapse,
      showMenu,
      clickedMenu,
      countOfPinnedPlugins,
      pinnedPlugins,
      toggleMenu
    } = this.props;

    const {
      searchText,
      searchedPlugins
    } = this.state

    const text = navCollapse === 3 ? "More plugins" : "More";

    const otherPlugins =
      searchText !== ''
        ? searchedPlugins
        : pinnedPlugins.length === 0
        ? pluginNavigations().slice(countOfPinnedPlugins)
        : filterPlugins(pluginNavigations(), pinnedPlugins);

    return (
      <div ref={this.wrapperRef}>
        <NavItem>
          <NavMenuItem navCollapse={navCollapse}>
            <a onClick={() => toggleMenu('more')}>
              <NavIcon className='icon-ellipsis-h' />
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
                        />
                      )
                    })}
                </MoreMenus>
              </React.Fragment>
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
                      countOfPinnedPlugins={countOfPinnedPlugins}
                    />
                  )
                })}
            </MoreMenus>
          </MoreMenuWrapper>
        </NavItem>
      </div>
    )
  }
}

export default NavigationMore;

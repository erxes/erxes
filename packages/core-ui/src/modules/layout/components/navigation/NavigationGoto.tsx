import React from 'react';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';
import {
  NavItem,
  NavIcon,
  GotoFormWrapper,
  GotoContentWrapper,
  GotoItem,
  GotoCategory,
  GotoModal,
  GotoMenuItem
} from '../../styles';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { ACTIONS, GENERAL_SETTINGS } from './constants';
import { pluginNavigations } from './utils';

type Props = {
  navCollapse: number;
};

type State = {
  show: boolean;
  keysPressed: any;
  plugins: any[];
  filteredPlugins: any[];
  searchValue: string;
  cursor: number;
};

export default class NavigationGoto extends React.Component<Props, State> {
  private searchFormInput: any;
  private actions: any[] = ACTIONS ? ACTIONS : [];
  private generalSettings: any[] = GENERAL_SETTINGS ? GENERAL_SETTINGS : [];
  constructor(props: Props) {
    super(props);

    this.state = {
      show: false,
      keysPressed: {},
      plugins: [],
      filteredPlugins: [],
      searchValue: '',
      cursor: 0
    };

    this.searchFormInput = React.createRef();
  }

  componentDidUpdate() {
    if (
      this.state.show &&
      this.searchFormInput &&
      this.searchFormInput.current
    ) {
      this.searchFormInput.current.focus();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleArrowSelection);

    const plugins: any[] = pluginNavigations() || [];
    const totalPlugins: any[] = [];

    if (plugins.length !== 0) {
      plugins[0].children.map((child: any, index: number) => {
        child.icon = 'icon-settings';
        child.name = child.scope;

        totalPlugins.push(child);
      });
    }

    for (const plugin of plugins) {
      delete plugin.children;

      totalPlugins.push(plugin);
    }

    this.setState({ plugins: [...totalPlugins, ...this.generalSettings] });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keydown', this.handleArrowSelection);
  }

  handleKeyDown = (event: any) => {
    const key = event.key;

    this.setState({ keysPressed: { ...this.state.keysPressed, [key]: true } });
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

  handleArrowSelection = (event: any) => {
    const { plugins, filteredPlugins, searchValue, cursor } = this.state;

    let maxCursor: number = 0;

    if (searchValue.length === 0) {
      maxCursor = this.actions.length + plugins.length;
    }

    if (searchValue.length !== 0) {
      maxCursor = filteredPlugins.length;
    }

    switch (event.keyCode) {
      case 13:
        const element = document.getElementById('nav-item-' + cursor);

        if (element) {
          element.click();
        }
        break;
      case 38:
        // Arrow move up
        if (cursor > 0) {
          this.setState({ cursor: cursor - 1 });
        } else {
          this.setState({ cursor: maxCursor - 1 });
        }
        break;
      case 40:
        // Arrow move down
        if (cursor < maxCursor - 1) {
          this.setState({ cursor: cursor + 1 });
        } else {
          this.setState({ cursor: 0 });
        }
        break;
      default:
        break;
    }
  };

  handleShow = () => {
    this.setState({ show: !this.state.show, keysPressed: {} });

    if (this.searchFormInput.current !== null) {
      console.log(this.searchFormInput.current);
    }
  };

  handleSearch = (event: any) => {
    let filteredPlugins: any[] = [];
    const searchValue: string = event.target.value;
    const allPlugins: any[] = [...this.state.plugins, ...this.actions];

    if (event.keyCode === 38 || event.keyCode === 40) {
      event.preventDefault();
    }

    this.setState({ searchValue, cursor: 0 });

    filteredPlugins = allPlugins.filter((plugin: any) => {
      if (searchValue.length === 0) {
        return;
      }

      if (plugin.text.toLowerCase().includes(searchValue.toLowerCase())) {
        return plugin;
      }
    });

    filteredPlugins = _.sortBy(filteredPlugins, ['name', 'text']);

    this.setState({ filteredPlugins });
  };

  handleClear = () => {
    this.setState({ searchValue: '', cursor: 0 });
  };

  renderActions = () => {
    if (this.state.searchValue.length === 0) {
      return (
        <>
          <GotoCategory>Actions</GotoCategory>
          {this.actions.map((item: any, index: number) => {
            return (
              <NavLink
                id={'nav-item-' + index}
                onClick={this.handleShow}
                to={item.url}
                key={index}
              >
                <GotoItem
                  className={this.state.cursor === index ? ' active' : ''}
                >
                  <i className={item.icon} />
                  <p>{item.text}</p>
                  <span>{item.name}</span>
                </GotoItem>
              </NavLink>
            );
          })}
        </>
      );
    }

    return null;
  };

  renderPlugins = () => {
    if (this.state.searchValue.length === 0) {
      return (
        <>
          <GotoCategory>Navigations</GotoCategory>
          {this.state.plugins.map((plugin: any, index: number) => {
            const navItemIndex = this.actions.length + index;

            return (
              <WithPermission
                key={index}
                action={plugin.permission ? plugin.permission : ''}
                actions={plugin.permissions ? plugin.permissions : []}
              >
                <NavLink
                  id={'nav-item-' + navItemIndex}
                  onClick={this.handleShow}
                  to={plugin.url ? plugin.url : plugin.to}
                >
                  <GotoItem
                    className={
                      this.state.cursor === navItemIndex ? ' active' : ''
                    }
                  >
                    <i className={plugin.icon} />
                    <p>{plugin.text}</p>
                    <span>{plugin.name}</span>
                  </GotoItem>
                </NavLink>
              </WithPermission>
            );
          })}
        </>
      );
    }

    return null;
  };

  renderFilteredPlugins = () => {
    const { filteredPlugins, searchValue, cursor } = this.state;

    if (filteredPlugins.length === 0 && searchValue.length !== 0) {
      return (
        <>
          <GotoCategory>Search results</GotoCategory>
          <GotoItem>
            <i>No result</i>
          </GotoItem>
        </>
      );
    }

    if (filteredPlugins.length !== 0 && searchValue.length !== 0) {
      return (
        <>
          <GotoCategory>Search results</GotoCategory>
          {filteredPlugins.map((plugin: any, index: number) => {
            const {
              permission,
              permissions,
              icon,
              text,
              name,
              to,
              url
            } = plugin;

            return (
              <WithPermission
                key={index}
                action={permission ? permission : ''}
                actions={permissions ? permissions : []}
              >
                <NavLink
                  id={'nav-item-' + index}
                  onClick={this.handleShow}
                  to={url ? url : to}
                >
                  <GotoItem className={cursor === index ? ' active' : ''}>
                    <i className={icon} />
                    <p>{text}</p>
                    <span>{name}</span>
                  </GotoItem>
                </NavLink>
              </WithPermission>
            );
          })}
        </>
      );
    }

    return null;
  };

  renderIcon = () => {
    const { navCollapse } = this.props;

    if (navCollapse === 1 || navCollapse === 2) {
      return <NavIcon className="icon-search" />;
    }

    return (
      <>
        <NavIcon className="icon-search" />
        <label>{__('Go to (Ctrl + M)')}</label>
      </>
    );
  };

  renderClearButton = () => {
    const { searchValue } = this.state;

    if (searchValue.length !== 0) {
      return <Icon icon="times" size={16} onClick={this.handleClear} />;
    }

    return null;
  };

  render() {
    const { keysPressed, searchValue, show, cursor } = this.state;

    const { navCollapse } = this.props;

    const element = document.getElementById('nav-item-' + cursor);

    if (keysPressed.Control === true && keysPressed.m === true) {
      this.handleShow();
    }

    if (element) {
      element.focus();
    }

    return (
      <React.Fragment>
        <NavItem isMoreItem={false}>
          <Tip placement="right" text={__('Go to... (Ctrl + M)')}>
            <GotoMenuItem isMoreItem={false} navCollapse={navCollapse}>
              <a onClick={this.handleShow}>{this.renderIcon()}</a>
            </GotoMenuItem>
          </Tip>
        </NavItem>

        <GotoModal show={show} onHide={this.handleShow} size="lg">
          <GotoFormWrapper>
            <Icon icon="search-1" size={16} />
            <input
              placeholder="Go to:"
              value={searchValue}
              onChange={this.handleSearch}
              ref={this.searchFormInput}
            />
            {this.renderClearButton()}
          </GotoFormWrapper>
          <GotoContentWrapper>
            {this.renderActions()}
            {this.renderPlugins()}
            {this.renderFilteredPlugins()}
          </GotoContentWrapper>
        </GotoModal>
      </React.Fragment>
    );
  }
}

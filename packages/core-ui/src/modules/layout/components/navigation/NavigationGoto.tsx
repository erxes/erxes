import React from 'react';
import { NavLink } from 'react-router-dom';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import {
  NavItem,
  NavMenuItem,
  NavIcon,
  GotoFormWrapper,
  GotoContentWrapper,
  GotoItem,
  GotoCategory
} from '../../styles';

import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { ACTIONS, GENERAL_SETTINGS } from './constants';
import { pluginNavigations } from './utils';

const GotoModal = styled(Modal)`
  & > div {
    border-radius: 10px;
    overflow: hidden;
  }
`;

type Props = {
  navCollapse: number;
};

type State = {
  show: boolean;
  keysPressed: any;
  plugins: any[];
  searchValue: string;
};

export default class NavigationGoto extends React.Component<Props, State> {
  private searchFormInput: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      show: false,
      keysPressed: {},
      plugins: [],
      filteredPlugins: [],
      searchValue: ''
    };

    this.searchFormInput = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.show && this.searchFormInput && this.searchFormInput.current)
      this.searchFormInput.current.focus();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    let plugins: any[] = pluginNavigations() || [];
    let totalPlugins: any[] = [];

    if (plugins.length !== 0)
      plugins[0].children.map((child: any, index: number) => {
        child.icon = 'icon-settings';
        child.name = child.scope;

        totalPlugins.push(child);
      });

    for (const plugin of plugins) {
      delete plugin.children;

      totalPlugins.push(plugin);
    }

    this.setState({ plugins: [...totalPlugins, ...GENERAL_SETTINGS] });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: any) => {
    let key = event.key;

    this.setState({ keysPressed: { ...this.state.keysPressed, [key]: true } });
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

  handleShow = () => {
    this.setState({ show: !this.state.show, keysPressed: {} });

    if (this.searchFormInput.current !== null)
      console.log(this.searchFormInput.current);
  };

  handleSearch = (event: any) => {
    let filteredPlugins: any[] = [];
    const searchValue: string = event.target.value;
    const allPlugins: any[] = [...this.state.plugins, ...ACTIONS];

    this.setState({ searchValue: searchValue });

    filteredPlugins = allPlugins.filter((plugin: any) => {
      if (searchValue.length === 0) return;

      if (plugin.text.toLowerCase().includes(searchValue.toLowerCase()))
        return plugin;
    });

    filteredPlugins = _.sortBy(filteredPlugins, ['name', 'text']);

    this.setState({ filteredPlugins: filteredPlugins });
  };

  handleClear = () => {
    this.setState({ searchValue: '' });
  };

  renderActions = () => {
    if (this.state.searchValue.length === 0)
      return (
        <>
          <GotoCategory>Actions</GotoCategory>
          {ACTIONS.map((item: any, index: number) => {
            return (
              <NavLink onClick={this.handleShow} to={item.url} key={index}>
                <GotoItem>
                  <i className={item.icon} />
                  <p>{item.text}</p>
                  <span>{item.name}</span>
                </GotoItem>
              </NavLink>
            );
          })}
        </>
      );

    return null;
  };

  renderPlugins = () => {
    if (this.state.searchValue.length === 0)
      return (
        <>
          <GotoCategory>Navigations</GotoCategory>
          {this.state.plugins.map((plugin: any, index: number) => {
            return (
              <WithPermission
                key={index}
                action={plugin.permission ? plugin.permission : ''}
                actions={plugin.permissions ? plugin.permissions : []}
              >
                <NavLink
                  onClick={this.handleShow}
                  to={plugin.url ? plugin.url : plugin.to}
                >
                  <GotoItem>
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

    return null;
  };

  renderFilteredPlugins = () => {
    const { filteredPlugins, searchValue } = this.state;

    if (filteredPlugins.length === 0 && searchValue.length !== 0)
      return (
        <>
          <GotoCategory>Search results</GotoCategory>
          <GotoItem>
            <i>No result</i>
          </GotoItem>
        </>
      );

    if (filteredPlugins.length !== 0 && searchValue.length !== 0)
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
                <NavLink onClick={this.handleShow} to={url ? url : to}>
                  <GotoItem>
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

    return null;
  };

  render() {
    const { keysPressed, searchValue, show } = this.state;

    const { navCollapse } = this.props;

    if (keysPressed.Control === true && keysPressed.m === true)
      this.handleShow();

    const renderIcon = () => {
      if (navCollapse === 1) return <NavIcon className="icon-search" />;

      return (
        <>
          <NavIcon className="icon-search" />
          <label>{__('Go to...')}</label>
        </>
      );
    };

    return (
      <React.Fragment>
        <NavItem isMoreItem={false}>
          <Tip placement="right" text={__('Go to... (Ctrl + M)')}>
            <NavMenuItem isMoreItem={false} navCollapse={navCollapse}>
              <a onClick={this.handleShow}>{renderIcon()}</a>
            </NavMenuItem>
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
            <Icon icon="times" size={16} onClick={this.handleClear} />
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

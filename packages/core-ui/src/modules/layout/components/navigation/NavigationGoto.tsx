import React from "react";
import { NavLink } from "react-router-dom";
import _ from "lodash";
import { Modal } from "react-bootstrap";
import {
  NavItem,
  NavMenuItem,
  NavIcon,
  GotoFormWrapper,
  GotoWrapper,
  GotoItem,
  GotoCategory
} from "../../styles";

import Tip from "modules/common/components/Tip";
import WithPermission from "modules/common/components/WithPermission";
import Icon from "modules/common/components/Icon";
import { __ } from "modules/common/utils";
import { pluginNavigations, getChildren } from './utils';

type Props = {
  navCollapse: number;
}

type State = {
  show: boolean;
  keysPressed: any;
  plugins: any[];
  searchValue: string;
}

export default class NavigationGoto extends React.Component<Props, State> {
  private searchFormInput: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      show: false,
      keysPressed: {},
      plugins: [],
      searchValue: "",
    }

    this.searchFormInput = React.createRef();
  }
  
  componentDidUpdate() {
    if (this.state.show === true && this.searchFormInput && this.searchFormInput.current)
      this.searchFormInput.current.focus();
  }
  
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    let plugins: any[] = pluginNavigations() || [];
    let totalPlugins: any[] = [];

    for (const plugin of plugins) {
      let children: any[] = getChildren(plugin);
      
      totalPlugins.push(plugin)

      for (const child of children) {
        child.icon = plugin.icon;
        child.name = plugin.name;

        totalPlugins.push(child);
      }
    }

    this.setState({ plugins: totalPlugins })
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown = (event: any) => {
    let key = event.key

    this.setState({ keysPressed: { ...this.state.keysPressed, [key]: true} })
  }

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } })
  }

  handleShow = () => {
    this.setState({ show: !this.state.show, keysPressed: {} });

    if (this.searchFormInput.current !== null)
      console.log(this.searchFormInput.current)
  }

  handleSearch = (event: any) => {
    this.setState({ searchValue: event.target.value })
  }

  handleClear = () => {
    this.setState({ searchValue: "" })
  }

  renderFilteredPlugins = () => {
    let filteredPlugins: any[] = [];
    const { plugins, searchValue } = this.state;

    filteredPlugins = plugins.filter((plugin: any) => {
      if (plugin.text.toLowerCase().includes(searchValue.toLowerCase()))
        return plugin
    })

    if (filteredPlugins.length === 0)
      return (
        <GotoItem>
          <i>No matching results</i>
        </GotoItem>
      )

    return filteredPlugins.map((plugin: any, index: number) => {
      if (!plugin.url)
        plugin.url = plugin.to

      return (
        <WithPermission
          key={index}
          action={plugin.permission ? plugin.permission : ""}
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
      )
    })
  }
  
  render() {
    const {
      keysPressed,
      searchValue,
      show
    } = this.state;

    const {
      navCollapse
    } = this.props;

    if (keysPressed.Control === true && keysPressed.m === true) 
      this.handleShow();
    
    return (
      <React.Fragment>
        <NavItem isMoreItem={false}>
          <Tip placement="right" text={__("Go to... (Ctrl + M)")}>
            <NavMenuItem isMoreItem={false} navCollapse={navCollapse}>
              <a onClick={this.handleShow}>
                {navCollapse === 1
                  ? <NavIcon className="icon-search" />
                  : (
                    <>
                      <NavIcon className="icon-search" />
                      <label>{__("Go to...")}</label>
                    </>
                  )
                }
              </a>
            </NavMenuItem>
          </Tip>
        </NavItem>

        <Modal
          show={show}
          onHide={this.handleShow}
        >
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
          <GotoWrapper>
            <GotoCategory>
              Navigation
            </GotoCategory>
            {this.renderFilteredPlugins()}
          </GotoWrapper>
        </Modal>
      </React.Fragment>
    )
  }
}
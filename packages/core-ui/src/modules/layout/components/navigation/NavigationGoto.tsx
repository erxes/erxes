import { ACTIONS, GENERAL_SETTINGS } from "./constants";
import {
  GotoCategory,
  GotoContentWrapper,
  GotoFormWrapper,
  GotoItem,
  GotoMenuItem,
  GotoModal,
  NavIcon,
  NavItem
} from "../../styles";
import { getConfig, setConfig } from "@erxes/ui/src/utils/core";

import Icon from "modules/common/components/Icon";
import { NavLink } from "react-router-dom";
import React from "react";
import Tip from "modules/common/components/Tip";
import WithPermission from "modules/common/components/WithPermission";
import _ from "lodash";
import { __ } from "modules/common/utils";
import { pluginNavigations } from "./utils";
import { Plugin, Action, GeneralSetting } from "./types";

type Props = {
  navCollapse: number;
};

type State = {
  show: boolean;
  keysPressed: any;
  plugins: Plugin[];
  filteredPlugins: Plugin[];
  searchValue: string;
  cursor: number;
};

export default class NavigationGoto extends React.Component<Props, State> {
  private searchFormInput: React.RefObject<HTMLInputElement>;
  private actions: Action[] = ACTIONS || [];
  private generalSettings: GeneralSetting[] = GENERAL_SETTINGS || [];
  constructor(props: Props) {
    super(props);

    this.state = {
      show: false,
      keysPressed: {},
      plugins: [],
      filteredPlugins: [],
      searchValue: "",
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
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("keydown", this.handleArrowSelection);

    const plugins: any[] = pluginNavigations() || [];
    const totalPlugins: any[] = [];

    if (plugins.length !== 0) {
      (plugins[0].children || []).map((child: Plugin) => {
        child.icon = "icon-settings";
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
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("keydown", this.handleArrowSelection);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key;

    this.setState({ keysPressed: { ...this.state.keysPressed, [key]: true } });
  };

  handleKeyUp = (event: KeyboardEvent) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

  handleArrowSelection = (event: KeyboardEvent) => {
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
        const element = document.getElementById("nav-item-" + cursor);

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

  handleShow = (item?) => {
    const config = getConfig("emailWidgetShow") || {};
    if (item?.type === "email" && config["show"] === false) {
      config["show"] = true;
      setConfig("emailWidgetShow", config);
    }

    this.setState({ show: !this.state.show, keysPressed: {} });
  };

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filteredPlugins: Plugin[] = [];
    const searchValue: string = event.target.value;
    const allPlugins: Plugin[] = [...this.state.plugins, ...this.actions];

    this.setState({ searchValue, cursor: 0 });

    filteredPlugins = allPlugins.filter((plugin: Plugin) => {
      if (searchValue.length === 0) {
        return;
      }

      if (plugin.text.toLowerCase().includes(searchValue.toLowerCase())) {
        return plugin;
      }
    });

    filteredPlugins = _.sortBy(filteredPlugins, ["name", "text"]);

    this.setState({ filteredPlugins });
  };

  handleClear = () => {
    this.setState({ searchValue: "", cursor: 0 });
  };

  renderActions = () => {
    if (this.state.searchValue.length === 0) {
      return (
        <>
          <GotoCategory>Actions</GotoCategory>
          {this.actions.map((item: Action, index: number) => {
            return (
              <NavLink
                id={"nav-item-" + index}
                onClick={() => this.handleShow(item)}
                to={item.url}
                key={index}
              >
                <GotoItem
                  className={this.state.cursor === index ? " active" : ""}
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
          {this.state.plugins.map((plugin: Plugin, index: number) => {
            const navItemIndex = this.actions.length + index;

            return (
              <WithPermission
                key={index}
                action={plugin.permission ? plugin.permission : ""}
                actions={plugin.permissions ? plugin.permissions : []}
              >
                <NavLink
                  id={"nav-item-" + navItemIndex}
                  onClick={this.handleShow}
                  to={plugin.url || plugin.to || ""}
                >
                  <GotoItem
                    className={
                      this.state.cursor === navItemIndex ? " active" : ""
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
          {filteredPlugins.map((plugin: Plugin, index: number) => {
            const { permission, permissions, icon, text, name, to, url } =
              plugin;

            return (
              <WithPermission
                key={index}
                action={permission ? permission : ""}
                actions={permissions ? permissions : []}
              >
                <NavLink
                  id={"nav-item-" + index}
                  onClick={this.handleShow}
                  to={url || to || ""}
                >
                  <GotoItem className={cursor === index ? " active" : ""}>
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
        <label>{__("Go to (Ctrl + M)")}</label>
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

    const element = document.getElementById("nav-item-" + cursor);

    if (keysPressed.Control === true && keysPressed.m === true) {
      this.handleShow();
    }

    if (element) {
      element.focus();
    }

    return (
      <React.Fragment>
        <NavItem $isMoreItem={false}>
          <Tip placement="right" text={__("Go to... (Ctrl + M)")}>
            <GotoMenuItem $isMoreItem={false} $navCollapse={navCollapse}>
              <a onClick={this.handleShow}>{this.renderIcon()}</a>
            </GotoMenuItem>
          </Tip>
        </NavItem>

        <GotoModal show={show} closeModal={this.handleShow} hideHeader={true}>
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

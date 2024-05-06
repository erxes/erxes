import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";

import { Attributes } from "../styles";
import { IOption } from "@erxes/ui/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  options: IOption[];
  isMulti?: boolean;
};

type State = {
  searchValue: string;
};

export default class SelectOption extends React.Component<Props, State> {
  private overlay: any;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: "",
    };
  }

  hideContent = () => {
    this.overlay.hide();
  };

  onChange = (item) => {
    this.overlay.hide();

    const { config, setConfig, inputName = "value" } = this.props;

    if (this.props.isMulti) {
      const value: string = config[inputName] || "";
      const re = /(\[\[ \w* \]\])/gi;
      const ids = value.match(re) || [];

      if (!ids.includes(`[[ ${item.value} ]]`)) {
        const comma = config[inputName] ? ", " : "";

        config[inputName] = `${config[inputName] || ""}${comma}[[ ${
          item.value
        } ]]`;
      }
    } else {
      config[inputName] = `[[ ${item.value} ]]`;
    }

    setConfig(config);
  };

  render() {
    let { options } = this.props;
    const { searchValue } = this.state;

    const onSearch = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      this.setState({ searchValue: value });
    };

    if (searchValue) {
      options = options.filter((option) =>
        new RegExp(searchValue, "i").test(option.label)
      );
    }
    return (
      <Popover
        innerRef={this.overlay}
        trigger={
          <span>
            {__("Options")} <Icon icon="angle-down" />
          </span>
        }
        placement="top"
      >
        <Attributes>
          <React.Fragment>
            <FormGroup>
              <ControlLabel>{__("Search")}</ControlLabel>
              <FormControl placeholder="type a search" onChange={onSearch} />
            </FormGroup>
            <li>
              <b>Default Options</b>
            </li>
            {options.map((item) => (
              <li key={item.label} onClick={this.onChange.bind(this, item)}>
                {item.label}
              </li>
            ))}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }
}

import { Attributes } from "@erxes/ui-cards/src/settings/boards/styles";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import { __ } from "coreui/utils";

type Props = {
  config: string;
  setConfig: (config: string) => void;
  attributions: any[];
};

export default class Attribution extends React.Component<Props> {
  private overlayRef = React.createRef<any>();

  hideContent = () => {
    this.overlayRef.current?.hide();
  };

  onClickAttribute = (item) => {
    this.hideContent();
    const { setConfig, config } = this.props;

    const characters = ["_", "-", "/", " "];
    const value = item.value;

    let newConfig = config;

    if (characters.includes(value)) {
      newConfig = `${newConfig}${value}`;
    } else {
      newConfig = `${newConfig}{${value}}`;
    }

    setConfig(newConfig);
  };

  render() {
    const { attributions } = this.props;

    return (
      <Popover
        trigger={
          <span>
            {__("Attribution")} <Icon icon="angle-down" />
          </span>
        }
        placement="top"
        ref={this.overlayRef}
      >
        <Attributes>
          <React.Fragment>
            <li>
              <b>{__("Attributions")}</b>
            </li>
            {attributions.map((item) => (
              <li
                key={item.value}
                onClick={() => this.onClickAttribute(item)}
              >
                {__(item.label)}
              </li>
            ))}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }
}

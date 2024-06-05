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
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onClickAttribute = (item) => {
    this.overlay.hide();
    const { setConfig } = this.props;
    let { config } = this.props;

    const characters = ["_", "-", "/", " "];

    const value = item.value;

    if (characters.includes(value)) {
      config = `${config}${value}`;
    } else {
      config = `${config}{${value}}`;
    }

    setConfig(config);
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
      >
        <Attributes>
          <React.Fragment>
            <li>
              <b>{__("Attributions")}</b>
            </li>
            {attributions.map((item) => (
              <li
                key={item.value}
                onClick={this.onClickAttribute.bind(this, item)}
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

import { Attributes } from "@erxes/ui-sales/src/settings/boards/styles";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import { __ } from "coreui/utils";

type Props = {
  config: string;
  setConfig: (config: string) => void;
  attributions: any[];
};

export default function Attribution(props: Props) {
  const onClickAttribute = (item, close) => {
    const { setConfig, config } = props;

    const characters = ["_", "-", "/", " "];

    const value = item.value;
    let changedConfig;

    if (characters.includes(value)) {
      changedConfig = `${config}${value}`;
    } else {
      changedConfig = `${config}{${value}}`;
    }

    setConfig(changedConfig);
    close();
  };

  const { attributions } = props;

  const content = close => {
    return (
      <Attributes>
        <React.Fragment>
          <li>
            <b>{__("Attributions")}</b>
          </li>
          {attributions.map(item => (
            <button
              key={item.value}
              onClick={() => onClickAttribute(item, close)}
            >
              {__(item.label)}
            </button>
          ))}
        </React.Fragment>
      </Attributes>
    );
  };

  return (
    <Popover
      trigger={
        <span>
          {__("Attribution")} <Icon icon="angle-down" />
        </span>
      }
      placement="top"
      closeAfterSelect
    >
      {content}
    </Popover>
  );
}

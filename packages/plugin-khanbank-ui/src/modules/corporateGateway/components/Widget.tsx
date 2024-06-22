import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";

import { WidgetButton } from "../../../styles";
import RateList from "../containers/Rates";

const Widget = () => {
  return (
    <>
      <Popover
        placement="bottom"
        trigger={
          <WidgetButton>
            <Icon icon="dollar-sign" size={20} />
          </WidgetButton>
        }
        className="notification-popover"
      >
        <RateList />
      </Popover>
    </>
  );
};

export default Widget;

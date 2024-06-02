import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";

// import { WidgetButton } from "../styles";
import RateList from "../containers/Rates";
import { Button } from "@erxes/ui";

const Widget = () => {
  return (
    <>
      <Popover
        placement="bottom"
        trigger={
          <Button>
            <Icon icon="dollar-sign" size={20} />
          </Button>
        }
        className="notification-popover"
      >
        <RateList />
      </Popover>
    </>
  );
};

export default Widget;

import "../../styles.css";

import { IDashboard, IReport } from "../../types";
import React, { useRef } from "react";

import Popover from "@erxes/ui/src/components/Popover";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";
import SelectMembersBox from "../../containers/utils/SelectMembersBox";
import { __ } from "@erxes/ui/src/utils/index";

type Props = {
  targets: IReport[] | IDashboard[];
  trigger: React.ReactNode;
  type: string;
};

const SelectMembersPopover = (props: Props) => {
  const { targets, trigger, type } = props;
  const overlayTriggerRef = useRef<any>(null);

  return (
    <Popover
      innerRef={overlayTriggerRef.current}
      trigger={trigger}
      placement="bottom-end"
      className="custom-popover"
    >
      <div className="popover-header">{__("Choose person")}</div>
      <PopoverContent>
        <SelectMembersBox targets={targets} type={type} />
      </PopoverContent>
    </Popover>
  );
};

export default SelectMembersPopover;

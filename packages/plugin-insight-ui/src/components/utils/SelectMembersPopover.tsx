import React, { useRef } from "react";
import Popover from "@erxes/ui/src/components/Popover";

import { __ } from "@erxes/ui/src/utils/index";

import SelectMembersBox from "../../containers/utils/SelectMembersBox";
import { IDashboard, IReport } from "../../types";
import "../../styles.css";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";

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
      ref={overlayTriggerRef.current}
      trigger={trigger}
      placement="bottom-end"
      className="custom-popover"
    >
      <h3>{__("Choose person")}</h3>
      <PopoverContent>
        <SelectMembersBox targets={targets} type={type} />
      </PopoverContent>
    </Popover>
  );
};

export default SelectMembersPopover;

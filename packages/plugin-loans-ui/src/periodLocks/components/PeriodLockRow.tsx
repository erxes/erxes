import _ from "lodash";
import React from "react";

import PeriodLockForm from "../containers/PeriodLockForm";
import { IPeriodLock } from "../types";
import { ActionButton } from "@erxes/ui/src/components/ActionButtons";
import Icon from "@erxes/ui/src/components/Icon";
import { formatValue } from "@erxes/ui/src/utils/core";
import FormControl from "@erxes/ui/src/components/form/Control";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { useNavigate } from 'react-router-dom';

type Props = {
  periodLock: IPeriodLock;
  isChecked: boolean;
  toggleBulk: (periodLock: IPeriodLock, isChecked?: boolean) => void;
};

function displayValue(periodLock, name) {
  const value = _.get(periodLock, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, periodLock: IPeriodLock) {
  const content = (props) => (
    <PeriodLockForm {...props} periodLock={periodLock} />
  );

  return (
    <ModalTrigger title="Edit periodLock" trigger={trigger} content={content} />
  );
}

function renderEditAction(periodLock: IPeriodLock) {
  const trigger = (
    <ActionButton
      style={{ cursor: "pointer" }}
      children={<Icon icon="edit-1" />}
    />
  );

  return renderFormTrigger(trigger, periodLock);
}

function PeriodLockRow({ periodLock, isChecked, toggleBulk }: Props) {
  const navigate = useNavigate()
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(periodLock, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/erxes-plugin-loan/periodLock-details/${periodLock._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={"code"}>{displayValue(periodLock, "date")}</td>

      <td onClick={onClick}>{renderEditAction(periodLock)}</td>
    </tr>
  );
}

export default PeriodLockRow;

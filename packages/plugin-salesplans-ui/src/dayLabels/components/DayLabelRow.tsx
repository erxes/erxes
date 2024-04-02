import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import Form from "../containers/EditForm";
import Icon from "@erxes/ui/src/components/Icon";
import Label from "@erxes/ui/src/components/Label";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import moment from "moment";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import { FormControl } from "@erxes/ui/src/components";
import { IDayLabel } from "../types";

type Props = {
  dayLabel: IDayLabel;
  isChecked: boolean;
  toggleBulk: (dayLabel: IDayLabel, isChecked?: boolean) => void;
};

const DayLabelRow = (props: Props) => {
  const { dayLabel, toggleBulk, isChecked } = props;
  const { _id, date, branch, department, labels } = dayLabel;

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(dayLabel, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const modalContent = (props) => {
    return <Form {...props} dayLabel={dayLabel} />;
  };

  const trigger = (
    <Button id="edit" btnStyle="link">
      <Icon icon="edit-3" />
    </Button>
  );

  return (
    <tr key={_id}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{moment(date).format("YYYY/MM/DD")}</td>
      <td>{branch ? `${branch.code} - ${branch.title}` : ""}</td>
      <td>{department ? `${department.code} - ${department.title}` : ""}</td>
      <td>
        {(labels || []).map((l) => (
          <span key={Math.random()}>
            <Label lblColor={l.color} children={l.title} />
            &nbsp;
          </span>
        ))}
      </td>
      <td>
        <ActionButtons>
          <Tip text={__("Edit")} placement="bottom">
            <ModalTrigger
              title="Edit label"
              trigger={trigger}
              autoOpenKey="showProductModal"
              content={modalContent}
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default DayLabelRow;

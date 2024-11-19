import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";
import React from "react";
import CtaxRowFormContainer from "../containers/CtaxRowForm";
import { ICtaxRow } from "../types";

type Props = {
  ctaxRow: ICtaxRow;
  isChecked: boolean;
  toggleBulk: (ctaxRow: ICtaxRow, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { ctaxRow, toggleBulk, isChecked } = props;

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(ctaxRow, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const content = (props) => <CtaxRowFormContainer {...props} ctaxRowId={ctaxRow._id} />;

  const {
    name,
    number,
    kind,
    status,
    percent
  } = ctaxRow;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td>{number || ''}</td>
      <td>{name}</td>
      <td>{kind}</td>
      <td>{status}</td>
      <td>{percent}</td>

      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit vatRow"
            trigger={trigger}
            size="xl"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;

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
import { useNavigate } from "react-router-dom";
import CtaxRowFormContainer from "../containers/CtaxRowForm";
import { ICtaxRow } from "../types";

type Props = {
  ctaxRow: ICtaxRow;
  isChecked: boolean;
  toggleBulk: (ctaxRow: ICtaxRow, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { ctaxRow, toggleBulk, isChecked } = props;
  const navigate = useNavigate();

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

  const { name, kind, } = ctaxRow;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td>{name}</td>
      <td>{kind}</td>

      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit ctaxRow"
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

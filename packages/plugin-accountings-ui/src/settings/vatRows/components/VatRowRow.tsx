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
import VatRowFormContainer from "../containers/VatRowForm";
import { IVatRow } from "../types";

type Props = {
  vatRow: IVatRow;
  isChecked: boolean;
  toggleBulk: (vatRow: IVatRow, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { vatRow, toggleBulk, isChecked } = props;

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(vatRow, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const content = (props) => <VatRowFormContainer {...props} vatRowId={vatRow._id} />;

  const {
    name,
    number,
    kind,
    tabCount,
    isBold,
    status,
    percent
  } = vatRow;

  const renderText = (value) => {
    if (isBold) {
      return <strong>value</strong>
    }
    return value
  }

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td>{renderText(`${'\u00A0 \u00A0'.repeat(tabCount)}${number || ''}`)}</td>
      <td>{renderText(name)}</td>
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

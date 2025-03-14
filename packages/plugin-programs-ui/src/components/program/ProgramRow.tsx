import { Button, FormControl, Icon, Tip, __ } from "@erxes/ui/src";

import React from "react";
import { useNavigate } from "react-router-dom";
import { IProgram } from "../../types";

type Props = {
  program: IProgram;
  isChecked: boolean;
  toggleBulk: (product: IProgram, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { program, toggleBulk, isChecked } = props;
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
      toggleBulk(program, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/settings/program/details/${program._id}`);
  };

  const { code, name, type, category, commentCount, unitPrice } = program;

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{type}</td>
      <td>{category ? category.name : "-"}</td>
      <td>{(unitPrice || 0).toLocaleString()}</td>
      <td>{commentCount ? commentCount : 0}</td>
    </tr>
  );
};

export default Row;

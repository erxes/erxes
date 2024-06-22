import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import React, { useState, useEffect } from "react";
import { __ } from "@erxes/ui/src/utils";
import { FormControl } from "@erxes/ui/src/components";
import { IReserveRem } from "../types";

type Props = {
  reserveRem: IReserveRem;
  isChecked: boolean;
  toggleBulk: (reserveRem: IReserveRem, isChecked?: boolean) => void;
  edit: (doc: IReserveRem) => void;
};

const Row: React.FC<Props> = (props) => {
  let timer;
  const [remainder, setRemainder] = useState(props.reserveRem.remainder || 0);
  const { edit, reserveRem, toggleBulk, isChecked } = props;

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        edit({ _id: reserveRem._id, remainder: Number(remainder) });
      }, 1000);
    };
  }, [remainder]);

  const onChangeValue = (e) => {
    const value = e.target.value;

    setRemainder(value);
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(reserveRem, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const { _id, branch, department, product, uom } = reserveRem;
  return (
    <tr key={_id}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{branch ? `${branch.code} - ${branch.title}` : ""}</td>
      <td>{department ? `${department.code} - ${department.title}` : ""}</td>
      <td>{product ? `${product.code} - ${product.name}` : ""}</td>
      <td>{uom || ""}</td>
      <td>
        <FormControl
          type="number"
          name={"remainder"}
          defaultValue={reserveRem.remainder || 0}
          onChange={onChangeValue}
        />
      </td>
      <td>
        <ActionButtons>.</ActionButtons>
      </td>
    </tr>
  );
};

export default Row;

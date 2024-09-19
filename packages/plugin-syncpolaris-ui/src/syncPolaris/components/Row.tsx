import FormControl from "@erxes/ui/src/components/form/Control";
import React from "react";
type Props = {
  item: any;
  toggleBulk: (target: any, toAdd: boolean) => void;
  isChecked?: boolean;
  type;
};

function CustomerRow({ item, toggleBulk, isChecked, type }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(item, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr key={item._id}>
      <td id="customersCheckBox" style={{ width: "50px" }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{type === "core:customer" ? item?.code : item?.number}</td>
      <td>{type === "core:customer" ? item?.lastName : item?.status}</td>
      <td>{type === "core:customer" ? item?.firstName : item?.startDate}</td>
      <td>{type === "core:customer" ? item?.phones : item?.endDate}</td>
    </tr>
  );
}

export default CustomerRow;

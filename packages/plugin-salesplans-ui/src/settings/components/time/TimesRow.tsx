import Form from "../../containers/time/TimesEditForm";
import React from "react";
import { ITimeProportion } from "../../types";
import { FormControl, TextInfo, ModalTrigger } from "@erxes/ui/src/components";

type Props = {
  timeProportion: ITimeProportion;
  isChecked: boolean;
  toggleBulk: (timeProportion: ITimeProportion, isChecked?: boolean) => void;
};

const Row = (props: Props) => {
  const { timeProportion, toggleBulk, isChecked } = props;

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(timeProportion, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const modalContent = (formProps) => {
    const updatedProps = {
      ...formProps,
      timeProportion,
    };

    return <Form {...updatedProps} />;
  };

  const { _id, department, branch, productCategory, percents } = timeProportion;

  const trigger = (
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
      <td>
        {productCategory
          ? `${productCategory.code} - ${productCategory.name}`
          : ""}
      </td>
      <td>{(percents || []).map((p) => `${p.percent},`)}</td>
    </tr>
  );

  return (
    <ModalTrigger
      title="Edit label"
      trigger={trigger}
      autoOpenKey="showProductModal"
      content={modalContent}
    />
  );
};

export default Row;

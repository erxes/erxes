import { IPlanValues, IYearPlan } from "../types";
import React, { useRef, useState } from "react";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import { FormControl } from "@erxes/ui/src/components";
import Icon from "@erxes/ui/src/components/Icon";
import { MONTHS } from "../../constants";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  yearPlan: IYearPlan;
  history: any;
  isChecked: boolean;
  toggleBulk: (yearPlan: IYearPlan, isChecked?: boolean) => void;
  edit: (doc: IYearPlan) => void;
};

const YearPlanRow = (props: Props) => {
  const { edit, yearPlan, isChecked, toggleBulk } = props;
  const { _id, year, branch, department, product, uom } = yearPlan;

  const [values, setValues] = useState(yearPlan.values || {});
  const timerRef = useRef<number | null>(null);

  const onChangeValue = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    const newValues = { ...values, [name]: value };

    setValues(newValues);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      edit({ _id: yearPlan._id, values: newValues });
    }, 1000);
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(yearPlan, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr key={_id}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{year}</td>
      <td>{branch ? `${branch.code} - ${branch.title}` : ""}</td>
      <td>{department ? `${department.code} - ${department.title}` : ""}</td>
      <td>{product ? `${product.code} - ${product.name}` : ""}</td>
      <td>{uom || ""}</td>
      {MONTHS.map((m) => (
        <td key={m}>
          <FormControl
            type="number"
            name={m}
            defaultValue={values[m] || 0}
            onChange={onChangeValue}
          />
        </td>
      ))}
      <td>
        {Object.values(values).reduce((sum, i) => Number(sum) + Number(i), 0)}
      </td>
      <td>
        <ActionButtons>
          <Tip text={__("Text")} placement="bottom">
            <Button id="action-button" btnStyle="link">
              <Icon icon="pen-1" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default YearPlanRow;

import _ from "lodash";
import {
  ActionButtons,
  __,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  formatValue
} from "@erxes/ui/src";
import React from "react";
import { IEbarimtProductRule } from "../types";
import ProductRuleForm from "../containers/ProductRuleForm";

type Props = {
  productRule: IEbarimtProductRule;
  isChecked: boolean;
  toggleBulk: (productRule: IEbarimtProductRule, isChecked?: boolean) => void;
};

function displayValue(productRule, name) {
  const value = _.get(productRule, name);

  return formatValue(value);
}

function IProductRuleRow({ productRule, isChecked, toggleBulk }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(productRule, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const content = (props) => <ProductRuleForm {...props} productRule={productRule} />;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'title'}>{displayValue(productRule, 'title')} </td>
      <td key={'kind'}>{displayValue(productRule, 'kind')}</td>
      <td key={'taxType'}>{displayValue(productRule, 'taxType')}</td>
      <td key={'taxCode'}>{displayValue(productRule, 'taxCode')}</td>
      <td key={'percent'}>{displayValue(productRule, 'taxPercent')}</td>
      <td key={'actions'}>
        <ActionButtons>
          <ModalTrigger
            title="Edit basic info"
            trigger={trigger}
            size="xl"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default IProductRuleRow;

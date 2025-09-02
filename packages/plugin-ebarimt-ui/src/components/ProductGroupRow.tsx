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
import { IEbarimtProductGroup } from "../types";
import ProductGroupForm from "../containers/ProductGroupForm";

type Props = {
  productGroup: IEbarimtProductGroup;
  isChecked: boolean;
  toggleBulk: (productGroup: IEbarimtProductGroup, isChecked?: boolean) => void;
};

function displayValue(productGroup, name) {
  const value = _.get(productGroup, name);

  return formatValue(value);
}

function IProductGroupRow({ productGroup, isChecked, toggleBulk }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(productGroup, e.target.checked);
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

  const content = (props) => <ProductGroupForm {...props} productGroup={productGroup} />;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'mainProduct'}>{`${productGroup.mainProduct?.code} - ${productGroup.mainProduct?.name}`}</td>
      <td key={'subProduct'}>{`${productGroup.subProduct?.code} - ${productGroup.subProduct?.name}`}</td>
      <td key={'sortNum'}>{displayValue(productGroup, 'sortNum')}</td>
      <td key={'ratio'}>{displayValue(productGroup, 'ratio')}</td>
      <td key={'isActive'}>{displayValue(productGroup, 'isActive')}</td>
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

export default IProductGroupRow;

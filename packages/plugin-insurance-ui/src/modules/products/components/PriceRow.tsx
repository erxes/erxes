import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { CompanyProductConfig } from '../../../gql/types';
import Button from '@erxes/ui/src/components/Button';
import { FlexRow } from '../../../styles';

type Props = {
  productConfig: CompanyProductConfig;
  index: number;
  onChange: (index: number, productConfig: CompanyProductConfig) => void;
  remove: (index: number) => void;
};

const Row = (props: Props) => {
  const { productConfig } = props;

  const onChangeInput = (e: any) => {
    props.onChange(props.index, {
      ...productConfig,
      specificPrice: e.target.value
    });
  };

  const remove = () => {
    props.remove(props.index);
  };

  return (
    <FlexRow>
      <SelectCompanies
        label="Choose vendor"
        name="vendors"
        initialValue={productConfig.companyId}
        multi={false}
        onSelect={companyId => {
          const id = companyId as string;

          props.onChange(props.index, {
            ...productConfig,
            companyId: id
          });
        }}
      />
      <FormControl
        componentClass="input"
        placeholder="Specific price for vendor"
        type="number"
        value={productConfig.specificPrice}
        useNumberFormat={true}
        onChange={onChangeInput}
      />
      <Button onClick={remove} btnStyle="danger" icon="times" />
    </FlexRow>
  );
};

export default Row;

import React, { useState } from 'react';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { Button, ControlLabel, FormGroup } from '@erxes/ui/src';
import { CatProd } from '../../../types';
import { FlexRow } from '../../../styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { FormColumn } from '@erxes/ui/src/styles/main';

type Props = {
  editMapping: (item: CatProd) => void;
  removeMapping: (_id: string) => void;
  key: string;
  index: number;
  item: CatProd;
};

const CatProdItem = (props: Props) => {
  const { item, index, editMapping, removeMapping } = props;

  const [state, setState] = useState({
    categoryId: (item && item.categoryId) || '',
    code: (item && item.code) || '',
    name: (item && item.name) || '',
    productId: (item && item.productId) || '',
  });

  const renderLabel = (label: string) => {
    if (index > 0) {
      return <></>;
    }
    return <ControlLabel>{label}</ControlLabel>;
  };

  const onSelectChange = (field: string, value: any) => {
    setState((prevState) => ({ ...prevState, [field]: value }));
    editMapping({ ...state, _id: item._id });
  };

  const onChangeInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setState((prevState) => ({ ...prevState, [name]: value }));
    editMapping({ ...state, _id: item._id });
  };

  return (
    <FlexRow key={item._id}>
      <FormColumn>
        <FormGroup>
          {renderLabel('Product Category')}
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={state.categoryId}
            customOption={{
              value: '',
              label: '...Clear product category filter',
            }}
            onSelect={(categoryId) => onSelectChange('categoryId', categoryId)}
            multi={false}
          />
        </FormGroup>
      </FormColumn>
      <FormColumn>
        <FormGroup>
          {renderLabel('Product Code Contains')}
          <FormControl
            name="code"
            type="text"
            defaultValue={state.code || ''}
            onChange={onChangeInput}
          />
        </FormGroup>
      </FormColumn>
      <FormColumn>
        <FormGroup>
          {renderLabel('Product Name Contains')}
          <FormControl
            name="name"
            type="text"
            defaultValue={state.name || ''}
            onChange={onChangeInput}
          />
        </FormGroup>
      </FormColumn>
      <FormColumn>
        <FormGroup>
          {renderLabel('Packaging products')}
          <SelectProducts
            label={''}
            name="productIds"
            onSelect={(option) => onSelectChange('productId', option)}
            initialValue={state.productId}
            multi={false}
          />
        </FormGroup>
      </FormColumn>
      <Button
        btnStyle="danger"
        icon="trash"
        onClick={() => removeMapping(item._id)}
      />
    </FlexRow>
  );
};

export default CatProdItem;

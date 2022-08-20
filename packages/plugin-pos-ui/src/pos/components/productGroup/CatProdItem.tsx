import React from 'react';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, Button } from '@erxes/ui/src';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IProductCategory } from '@erxes/ui-products/src/types';

import { FlexRow } from '../../../styles';
import { CatProd } from '../../../types';

type Props = {
  editMapping: (item: CatProd) => void;
  removeMapping: (_id: string) => void;
  key: string;
  item: CatProd;
  productCategories: IProductCategory[];
};

type State = {
  categoryId: string;
  productId: string;
};

export default class CatProdItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { item } = props;

    this.state = {
      categoryId: item && item.categoryId,
      productId: item && item.productId
    };
  }

  render() {
    const { productCategories, item, editMapping, removeMapping } = this.props;
    const { productId, categoryId } = this.state;

    const onSelectChange = (field: string, option: any) => {
      const value = option && option.value ? option.value : '' || option;

      this.setState({ [field]: value } as any);

      editMapping({ productId, categoryId, [field]: value, _id: item._id });
    };

    const categoryOptions = productCategories.map(e => ({
      value: e._id,
      label: e.name
    }));

    return (
      <FlexRow key={item._id}>
        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          <Select
            options={categoryOptions}
            value={categoryId}
            onChange={option => onSelectChange('categoryId', option)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Product</ControlLabel>
          <SelectProducts
            label={''}
            name="kioskExcludeProductIds"
            onSelect={option => onSelectChange('productId', option)}
            initialValue={productId}
            multi={false}
          />
        </FormGroup>
        <Button
          btnStyle="danger"
          icon="trash"
          onClick={() => removeMapping(item._id)}
        />
      </FlexRow>
    );
  }
}

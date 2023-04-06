import React from 'react';
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

type State = {
  categoryId: string;
  code?: string;
  name?: string;
  productId: string;
};

export default class CatProdItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { item } = props;

    this.state = {
      categoryId: item && item.categoryId,
      code: item && item.code,
      name: item && item.name,
      productId: item && item.productId
    };
  }

  renderLabel(label: string) {
    const { index } = this.props;
    if (index > 0) {
      return <></>;
    }
    return <ControlLabel>{label}</ControlLabel>;
  }

  render() {
    const { item, editMapping, removeMapping } = this.props;
    const { productId, categoryId, code, name } = this.state;

    const onSelectChange = (field: string, value: any) => {
      this.setState({ [field]: value } as any, () => {
        editMapping({ ...this.state, _id: item._id });
      });
    };
    const onChangeInput = e => {
      const name = e.target.name;
      const value = e.target.value;
      this.setState({ [name]: value } as any, () => {
        editMapping({ ...this.state, _id: item._id });
      });
    };

    return (
      <FlexRow key={item._id}>
        <FormColumn>
          <FormGroup>
            {this.renderLabel('Product Category')}
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={categoryId}
              customOption={{
                value: '',
                label: '...Clear product category filter'
              }}
              onSelect={categoryId => onSelectChange('categoryId', categoryId)}
              multi={false}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            {this.renderLabel('Product Code Contains')}
            <FormControl
              name="code"
              type="text"
              defaultValue={code || ''}
              onChange={onChangeInput}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            {this.renderLabel('Product Name Contains')}
            <FormControl
              name="name"
              type="text"
              defaultValue={name || ''}
              onChange={onChangeInput}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            {this.renderLabel('Packaging products')}
            <SelectProducts
              label={''}
              name="productIds"
              onSelect={option => onSelectChange('productId', option)}
              initialValue={productId}
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
  }
}

import React from 'react';
import { FormGroup, ControlLabel, Button, FormControl } from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { FlexRow } from '../../../styles';
import { CatProd, IPos, ISlotGroup } from '../../../types';
import { Input } from '@erxes/ui/src/components/form/styles';

type Props = {
  removeMapping: (_id: string) => void;
  key: string;
  item: CatProd;
  productCategories: IProductCategory[];
  pos: IPos;
  onChange: (name: 'pos' | 'brand', value: any) => void;
  onSubmit: (group: ISlotGroup) => void;
};

type State = {
  categoryId: string;
  productId: string;
};

export default class PosProdItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { item } = props;

    this.state = {
      categoryId: item && item.categoryId,
      productId: item && item.productId
    };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };
  onChangeInput = e => {
    const { pos } = this.props;
    pos[e.target.id] = (e.currentTarget as HTMLInputElement).value;
    this.onChangeFunction('pos', pos);
  };

  render() {
    const { productCategories, item, removeMapping } = this.props;
    const { productId, categoryId } = this.state;

    const onSelectChange = (field: string, option: any) => {
      const value = option && option.value ? option.value : '' || option;

      this.setState({ [field]: value } as any);
    };

    const categoryOptions = productCategories.map(e => ({
      value: e._id,
      label: e.name
    }));

    return (
      <FlexRow style={{ alignItems: 'center' }}>
        <FormGroup>
          <ControlLabel>Code </ControlLabel>
          <FormControl
            id="name"
            type="text"
            value={''}
            onChange={this.onChangeInput}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <Input
            label={''}
            name="kioskExcludeProductIds"
            onSelect={option => onSelectChange('productId', option)}
            value={''}
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

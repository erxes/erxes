import { IProductCategory } from '@erxes/ui-products/src/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  productCategories?: IProductCategory[];
  field?: IField;
  onChange: (name: string, value: string) => void;
};

class SelectCatgory extends React.Component<Props> {
  render() {
    const { productCategories = [], field } = this.props;

    const onCategoryChange = e => {
      this.props.onChange(
        'productCategoryId',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Categories:</ControlLabel>
          <FormControl
            id="productCategories"
            componentClass="select"
            defaultValue={(field && field.productCategoryId) || ''}
            onChange={onCategoryChange}
          >
            <option>-</option>
            {productCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </>
    );
  }
}

export default SelectCatgory;

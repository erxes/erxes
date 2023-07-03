import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { ICategory } from '@erxes/ui/src/utils/categories';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  categories: ICategory[];
  onChange?: (values: string[]) => any;
  defaultValue?: string[];
  isRequired?: boolean;
  description?: string;
};

class SelectCategories extends React.Component<Props, {}> {
  generateUserOptions(array: ICategory[] = []): IOption[] {
    return array.map(item => {
      const category = item || ({} as ICategory);

      return {
        value: category._id,
        label: category.name
      };
    });
  }

  onChangeCategory = values => {
    if (this.props.onChange) {
      this.props.onChange(values.map(item => item.value) || []);
    }
  };

  render() {
    const { categories, defaultValue } = this.props;

    return (
      <FormGroup>
        <ControlLabel>{'Categories'}</ControlLabel>
        <p>
          {__('In which Category(s) do you want to add this property group?')}
        </p>
        <Select
          placeholder={__('Select category')}
          value={defaultValue}
          onChange={this.onChangeCategory}
          options={this.generateUserOptions(categories)}
          multi={true}
        />
      </FormGroup>
    );
  }
}

export default SelectCategories;

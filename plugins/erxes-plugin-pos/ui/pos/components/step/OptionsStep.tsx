import { FormGroup, ControlLabel, FormControl } from 'erxes-ui';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import React from 'react';
import { FlexColumn, FlexItem } from '../../../styles';
import { IBrand } from 'erxes-ui/lib/products/types';
import SelectBrand from '../../containers/SelectBrand';
import Select from 'react-select-plus';
type Props = {
  onChange: (name: 'name' | 'description' | 'brand', value: any) => void;
  name?: string;
  description?: string;
  brand?: IBrand;
};

class OptionsStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  render() {
    const { name, description, brand } = this.props;

    const onChangeBrand = e =>
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeName = e =>
      this.onChangeFunction(
        'name',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeDescription = e =>
      this.onChangeFunction(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                id="name"
                type="text"
                value={name}
                onChange={onChangeName}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                id="description"
                componentClass="textarea"
                value={description}
                onChange={onChangeDescription}
              />
            </FormGroup>

            <FormGroup>
              <SelectBrand
                isRequired={true}
                onChange={onChangeBrand}
                defaultValue={brand ? brand._id : ' '}
              />
            </FormGroup>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default OptionsStep;

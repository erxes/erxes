import { FormGroup, ControlLabel, FormControl } from 'erxes-ui';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import React from 'react';
import { FlexColumn, FlexItem } from '../../../styles';
import { IBrand } from 'erxes-ui/lib/products/types';
import SelectBrand from '../../containers/SelectBrand';
import Select from 'react-select-plus';
import { IPos } from '../../../types';
type Props = {
  onChange: (name: 'pos' | 'brand', value: any) => void;
  pos?: IPos;
  brand?: IBrand;
};

class OptionsStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  render() {
    const { pos, brand } = this.props;

    let name = 'POS name';
    let description = 'description';

    if (pos) {
      name = pos.name;
      description = pos.description;
    }

    const onChangeBrand = e => {
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeName = e => {
      const { pos } = this.props;

      pos.name = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('pos', pos);
    };

    const onChangeDescription = e => {
      const { pos } = this.props;

      pos.description = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('pos', pos);
    };

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

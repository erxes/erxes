import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { ICoordinates } from '../../../types';

import { IDistrict } from '../types';

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

type Props = {
  districts: IDistrict[];
  isRequired?: boolean;
  description?: string;
  defaultValue?: string[] | string;
  multi?: boolean;
  onChange: (value: any, center?: ICoordinates) => void;
};

class SelectDistrict extends React.Component<Props, {}> {
  generateOptions(array: IDistrict[] = []): IOption[] {
    return array.map(item => {
      const district = item || ({} as IDistrict);

      return {
        value: district._id,
        label: district.name
      };
    });
  }

  onChangeDistrict = values => {
    const { onChange, multi } = this.props;

    if (!multi) {
      const dist =
        values && this.props.districts.find(d => d._id === values.value);

      console.log('distcit ****************', dist);

      return onChange(values ? values.value : '', dist && dist.center);
    }

    onChange(values.map(item => item.value) || []);
  };

  render() {
    const { districts, defaultValue } = this.props;
    console.log('districts', districts);
    return (
      <FormGroup>
        <ControlLabel required={this.props.isRequired}>Districts</ControlLabel>
        <p> {this.props.description ? this.props.description : ''}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select district')}
              value={defaultValue}
              onChange={this.onChangeDistrict}
              options={this.generateOptions(districts)}
              multi={this.props.multi}
            />
          </LeftContent>
        </Row>
      </FormGroup>
    );
  }
}

export default SelectDistrict;

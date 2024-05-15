import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
// import Select from 'react-select-plus';
import Select from 'react-select';

import { LeftContent, Row } from '../../../styles';
import { IQuarter } from '../types';

type Props = {
  quarters: IQuarter[];
  isRequired?: boolean;
  description?: string;
  defaultValue?: string[] | string;
  multi?: boolean;
  onChange: (value) => void;
};

class SelectDistrict extends React.Component<Props, {}> {
  generateOptions(array: IQuarter[] = []): IOption[] {
    return array.map(item => {
      const quarter = item || ({} as IQuarter);

      return {
        value: quarter._id,
        label: quarter.name,
      };
    });
  }

  onChangeDistrict = values => {
    const { onChange, multi } = this.props;

    if (!multi) {
      return onChange(values ? values.value : '');
    }

    onChange(values.map(item => item.value) || []);
  };

  render() {
    const { quarters, defaultValue } = this.props;
    return (
      <FormGroup>
        <ControlLabel required={this.props.isRequired}>Quarters</ControlLabel>
        <p> {this.props.description ? this.props.description : ''}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select quarter')}
              value={defaultValue}
              onChange={this.onChangeDistrict}
              options={this.generateOptions(quarters)}
              multi={this.props.multi}
            />
          </LeftContent>
        </Row>
      </FormGroup>
    );
  }
}

export default SelectDistrict;

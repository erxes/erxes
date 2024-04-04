import { IButtonMutateProps, IOption } from '@erxes/ui/src/types';
import {
  LeftContent,
  Row
} from '@erxes/ui-inbox/src/settings/integrations/styles';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IField } from '@erxes/ui/src/types';
import { IFieldGroup } from '../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PropertyForm from '../containers/PropertyForm';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
  properties: IField[];
  groups: IFieldGroup[];
  onChange?: (field: IField) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  defaultValue?: string;
  description?: string;
};

class SelectProperty extends React.Component<Props, {}> {
  renderAddProperty = () => {
    const { renderButton, queryParams } = this.props;

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Create
      </Button>
    );

    const content = props => (
      <PropertyForm
        {...props}
        renderButton={renderButton}
        queryParams={queryParams}
      />
    );

    return (
      <ModalTrigger
        title="Create property"
        trigger={trigger}
        content={content}
      />
    );
  };

  generateUserOptions(array: IField[] = []): IOption[] {
    return array.map(e => ({ label: e.text || '', value: e._id }));
  }

  onChangeProperty = option => {
    if (this.props.onChange) {
      const { properties } = this.props;
      const customProperty = properties.find(e => e._id === option.value);
      if (customProperty) {
        this.props.onChange(customProperty);
      }
    }
  };

  render() {
    const { properties, defaultValue, description } = this.props;

    return (
      <FormGroup>
        <ControlLabel>Property</ControlLabel>
        <p>{description}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select property')}
              value={defaultValue}
              onChange={this.onChangeProperty}
              options={this.generateUserOptions(properties)}
              multi={false}
              clearable={false}
            />
          </LeftContent>
          {this.renderAddProperty()}
        </Row>
      </FormGroup>
    );
  }
}

export default SelectProperty;

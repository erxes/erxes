import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps, IOption } from 'modules/common/types';
import { LeftContent, Row } from 'modules/settings/integrations/styles';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '../../../common/utils';
import PropertyForm from '../containers/PropertyForm';
import { IField, IFieldGroup } from '../types';

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
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add property
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
        <ControlLabel>Custom property</ControlLabel>
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

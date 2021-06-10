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

type State = {
  properties: IField[];
};

class SelectProperty extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      properties: props.properties || []
    };
  }

  renderAddProperty = () => {
    const { renderButton, queryParams } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
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
      const { properties } = this.state;
      const customProperty = properties.find(e => e._id === option.value);
      if (customProperty) {
        this.props.onChange(customProperty);
      }
    }
  };

  render() {
    const { defaultValue, description } = this.props;
    const { properties } = this.state;

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

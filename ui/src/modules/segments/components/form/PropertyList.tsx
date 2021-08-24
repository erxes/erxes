import { IBoard } from 'modules/boards/types';
import Select from 'react-select-plus';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/segments/types';
import React from 'react';
import { ConditionItem } from 'modules/segmentsOld/components/styles';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { PROPERTY_TYPES } from '../constants';
import PropertyForm from './PropertyForm';

type Props = {
  contentType: string;
  fields: IField[];
  boards?: IBoard[];
  fetchFields: (propertyType: string, pipelineId?: string) => void;
};

type State = {
  propertyType: string;
  chosenField?: IField;
};

class PropertyList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const propertyType = props.contentType;

    this.state = { propertyType };
  }

  groupByType = () => {
    const { fields = [] } = this.props;

    return fields.reduce((acc, field) => {
      const value = field.value;
      let key;

      if (field.group) {
        key = field.group;
      } else {
        key =
          value && value.includes('.')
            ? value.substr(0, value.indexOf('.'))
            : 'general';
      }

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(field);

      return acc;
    }, {});
  };

  onClickField = field => {
    this.setState({ chosenField: field });
  };

  onClickBack = () => {
    this.setState({ chosenField: undefined });
  };

  renderFields = fields => {
    return fields.map(field => {
      return <p onClick={this.onClickField.bind(this, field)}>{field.label}</p>;
    });
  };

  renderGroups = () => {
    const objects = this.groupByType();

    return Object.keys(objects).map(key => {
      return (
        <>
          <ControlLabel>{key}</ControlLabel>

          {this.renderFields(objects[key])}
        </>
      );
    });
  };

  renderFieldDetail = () => {
    const { chosenField } = this.state;

    if (chosenField) {
      return (
        <PropertyForm onClickBack={this.onClickBack} field={chosenField} />
      );
    }

    return;
  };

  renderContent = () => {
    const { chosenField } = this.state;

    if (!chosenField) {
      return this.renderGroups();
    }

    return this.renderFieldDetail();
  };

  render() {
    const { contentType, fetchFields } = this.props;
    const { propertyType } = this.state;

    const options = PROPERTY_TYPES[contentType];

    const onChange = e => {
      this.setState({ propertyType: e.value, chosenField: undefined });

      fetchFields(e.value);
    };

    const generateSelect = () => {
      return (
        <Select
          clearable={false}
          value={propertyType}
          options={options.map(option => ({
            value: option.value,
            label: option.label
          }))}
          onChange={onChange}
        />
      );
    };

    return (
      <>
        <ConditionItem>
          <FlexContent>
            <FlexItem count={3} hasSpace={true}>
              <FormGroup>
                <ControlLabel>Property type</ControlLabel>
                {generateSelect()}
              </FormGroup>
            </FlexItem>
          </FlexContent>
        </ConditionItem>
        {this.renderContent()}
      </>
    );
  }
}

export default PropertyList;

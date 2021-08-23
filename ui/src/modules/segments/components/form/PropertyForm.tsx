import { IBoard } from 'modules/boards/types';
import Select from 'react-select-plus';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/segments/types';
import React from 'react';
import {
  ConditionItem,
  SegmentWrapper
} from 'modules/segmentsOld/components/styles';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { PROPERTY_TYPES } from '../constants';

type Props = {
  contentType: string;
  fields: IField[];
  boards?: IBoard[];
  fetchFields: (propertyType: string, pipelineId?: string) => void;
};

type State = {
  propertyType: string;
};

class SegmentFormAutomations extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const propertyType = props.contentType;

    this.state = { propertyType };
  }

  renderFields = () => {
    const { fields } = this.props;

    return fields.map(field => {
      return <p>{field.label}</p>;
    });
  };

  renderForm = (formProps: IFormProps) => {
    const { contentType, fetchFields } = this.props;
    const { propertyType } = this.state;

    const options = PROPERTY_TYPES[contentType];

    const onChange = e => {
      this.setState({ propertyType: e.value });

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
        {this.renderFields()}
      </>
    );
  };

  render() {
    return (
      <SegmentWrapper>
        <CommonForm renderContent={this.renderForm} />
      </SegmentWrapper>
    );
  }
}

export default SegmentFormAutomations;

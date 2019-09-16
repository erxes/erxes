import Button from 'modules/common/components/Button';
import colors from 'modules/common/styles/colors';
import { IFormSubmission } from 'modules/forms/types';
import { IGrowthHack } from 'modules/growthHacks/types';
import GenerateField from 'modules/settings/properties/components/GenerateField';
import React from 'react';
import styled from 'styled-components';

const RightContainer = styled.div`
  background: #fff;
  padding: 30px;
  box-shadow: 0 0 6px 1px rgba(221, 221, 221, 0.7);
  align-self: baseline;
  flex-basis: 450px;
`;

const CurrentStage = styled.div`
  margin-bottom: 20px;
  color: ${colors.colorCoreGray};
  font-weight: 500;
  font-size: 12px;

  h4 {
    color: ${colors.colorCoreDarkGray};
    margin: 2px 0 0;
    font-size: 16px;
  }
`;

type Props = {
  item: IGrowthHack;
  onChangeExtraField: (name: 'formSubmissions', value: any) => void;
  save: (doc: IFormSubmission) => void;
  formSubmissions: any;
  formId: string;
};

class StageForm extends React.Component<Props> {
  renderFormFields() {
    const {
      formId,
      item: { formFields = [], formSubmissions },
      onChangeExtraField
    } = this.props;

    if (!formId) {
      return null;
    }

    const onChangeFormField = (field: { _id: string; value: string }) => {
      formSubmissions[field._id] = field.value;
      onChangeExtraField('formSubmissions', formSubmissions);
    };

    return formFields.map(field => (
      <GenerateField
        defaultValue={formSubmissions[field._id]}
        key={field._id}
        field={field}
        onValueChange={onChangeFormField}
      />
    ));
  }

  render() {
    const { item, formSubmissions, formId } = this.props;

    const stageName = item.stage && item.stage.name;

    const save = () => {
      this.props.save({ contentTypeId: item._id, formId, formSubmissions });
    };

    return (
      <RightContainer>
        <CurrentStage>
          Currently on <h4>{stageName}</h4>
        </CurrentStage>
        {this.renderFormFields()}
        <Button
          style={{ float: 'right' }}
          onClick={save}
          type="submit"
          btnStyle="success"
          icon="checked-1"
        >
          Save
        </Button>
      </RightContainer>
    );
  }
}

export default StageForm;

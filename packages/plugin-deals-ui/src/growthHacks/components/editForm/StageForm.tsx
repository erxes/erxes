import Button from '@erxes/ui/src/components/Button';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { IFormSubmission } from '@erxes/ui-forms/src/forms/types';
import { IGrowthHack } from '../../types';
import React from 'react';
import colors from '@erxes/ui/src/styles/colors';
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
};

class StageForm extends React.Component<Props> {
  renderFormFields() {
    const {
      item: { formFields = [], formSubmissions, formId },
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
    const { item } = this.props;

    const stageName = item.stage && item.stage.name;
    const formSubmissions = item.formSubmissions || {};

    const save = () => {
      this.props.save({
        contentTypeId: item._id,
        formId: item.formId || '',
        formSubmissions
      });
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

import Button from 'modules/common/components/Button';
import colors from 'modules/common/styles/colors';
import { IFormSubmission } from 'modules/forms/types';
import FormFields from 'modules/growthHacks/containers/FormFields';
import { IGrowthHack } from 'modules/growthHacks/types';
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
  render() {
    const { item, onChangeExtraField, formSubmissions, formId } = this.props;

    const stageName = item.stage && item.stage.name;

    const onChangeFormField = field => {
      formSubmissions[field._id] = field.value;
      onChangeExtraField('formSubmissions', formSubmissions);
    };

    const save = () => {
      this.props.save({ contentTypeId: item._id, formId, formSubmissions });
    };

    return (
      <RightContainer>
        <CurrentStage>
          Currently on <h4>{stageName}</h4>
        </CurrentStage>
        {formId ? (
          <FormFields
            onChangeFormField={onChangeFormField}
            formSubmissions={formSubmissions}
            formId={formId}
          />
        ) : null}
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

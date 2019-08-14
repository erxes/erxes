import colors from 'modules/common/styles/colors';
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
    margin: 5px 0 0;
    font-size: 16px;
  }
`;

type Props = {
  item: IGrowthHack;
  onChangeExtraField: (name: 'formFields', value: any) => void;
  formFields: any;
};

class RigthContent extends React.Component<Props> {
  render() {
    const { item, onChangeExtraField, formFields } = this.props;
    const { formId } = item;

    const stageName = item.stage && item.stage.name;

    const onChangeFormField = field => {
      formFields[field._id] = field.value;
      onChangeExtraField('formFields', formFields);
    };

    return (
      <RightContainer>
        <CurrentStage>
          Currently on <h4>{stageName}</h4>
        </CurrentStage>
        {formId ? (
          <FormFields
            onChangeFormField={onChangeFormField}
            formFields={formFields}
            formId={formId}
          />
        ) : null}
      </RightContainer>
    );
  }
}

export default RigthContent;

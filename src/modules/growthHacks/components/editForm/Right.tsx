import { Watch } from 'modules/boards/containers/editForm/';
import { RightButton } from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
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

type Props = {
  item: IGrowthHack;
  onChangeExtraField: (
    name: 'hackDescription' | 'goal' | 'formFields',
    value: any
  ) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  options: IOptions;
  formFields: any;
};

class RigthContent extends React.Component<Props> {
  render() {
    const {
      item,
      copyItem,
      options,
      removeItem,
      onChangeExtraField,
      formFields
    } = this.props;
    const { formId } = item;

    const onClick = () => removeItem(item._id);
    const onChangeFormField = field => {
      formFields[field._id] = field.value;
      onChangeExtraField('formFields', formFields);
    };

    return (
      <RightContainer>
        {formId ? (
          <FormFields
            onChangeFormField={onChangeFormField}
            formFields={formFields}
            formId={formId}
          />
        ) : null}

        <Watch item={item} options={options} />

        <RightButton icon="checked-1" onClick={copyItem}>
          Copy
        </RightButton>

        <RightButton icon="cancel-1" onClick={onClick}>
          Delete
        </RightButton>
      </RightContainer>
    );
  }
}

export default RigthContent;

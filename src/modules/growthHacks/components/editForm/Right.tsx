import { Watch } from 'modules/boards/containers/editForm/';
import { RightButton } from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import FormFields from 'modules/growthHacks/containers/FormFields';
import { IGrowthHack } from 'modules/growthHacks/types';
import React from 'react';
import styled from 'styled-components';

const RightContainer = styled.div`
  flex: 1;
`;

type Props = {
  item: IGrowthHack;
  onChangeField?: (name: string, value: any) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  options: IOptions;
};

class RigthContent extends React.Component<Props> {
  render() {
    const { item, copyItem, options, removeItem } = this.props;
    const { formId, formFields } = item;

    const onClick = () => removeItem(item._id);

    return (
      <RightContainer>
        {formId ? <FormFields formFields={formFields} formId={formId} /> : null}

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

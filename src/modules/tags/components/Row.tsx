import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tags from 'modules/common/components/Tags';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import React from 'react';
import Form from './Form';

type Props = {
  tag: ITag;
  type: string;
  count?: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
};

function Row({ tag, type, count, renderButton, remove }: Props) {
  function removeTag() {
    remove(tag);
  }

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')}>
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  const content = props => (
    <Form {...props} type={type} tag={tag} renderButton={renderButton} />
  );

  return (
    <tr>
      <td>
        <Tags tags={[tag]} size="medium" />
      </td>
      <td>
        <TextInfo>{count || '0'}</TextInfo>
      </td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title="Edit response"
            trigger={editTrigger}
            content={content}
          />

          <Tip text={__('Delete')}>
            <Button btnStyle="link" onClick={removeTag} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;

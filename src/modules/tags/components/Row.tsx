import { __ } from 'modules/common/utils';
import { ITag, ITagSaveParams } from 'modules/tags/types';
import * as React from 'react';
import {
  ActionButtons,
  Button,
  Icon,
  ModalTrigger,
  Tags,
  TextInfo,
  Tip
} from '../../common/components';
import Form from './Form';

type Props = {
  tag: ITag;
  type: string;
  count?: number;
  refetchQueries: any;
  remove: (tag: ITag) => void;
};

function Row({ tag, type, count, refetchQueries, remove }: Props) {
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
    <Form {...props} type={type} tag={tag} refetchQueries={refetchQueries} />
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

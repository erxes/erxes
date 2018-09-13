import { __ } from 'modules/common/utils';
import { ITag, ITagSaveDoc } from 'modules/tags/types';
import * as React from 'react';
import {
  ActionButtons,
  Button,
  Icon,
  ModalTrigger,
  Tags,
  Tip
} from '../../common/components';
import Form from './Form';

type Props = {
  tag: ITag,
  type: string,
  count: number,
  remove: (tag: ITag) => void,
  save: (params: { tag: ITag, doc: ITagSaveDoc, callback: () => void }) => void
};

function Row({ tag, type, count, remove, save }: Props) {
  function removeTag() {
    remove(tag);
  }

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit').toString()}>
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  return (
    <tr>
      <td>
        <Tags tags={[tag]} size="medium" />
      </td>
      <td>{count}</td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title="Edit response"
            trigger={editTrigger}
            content={(props) => <Form {...props} type={type} tag={tag} save={save} />}
          />

          <Tip text={__('Delete').toString()}>
            <Button btnStyle="link" onClick={removeTag} icon="close-circled" />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;

import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Form from './Form';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type Props = {
  tag: ITag;
  type: string;
  count?: number;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  tags: ITag[];
};

function Row({ tag, type, count, renderButton, remove, space, tags }: Props) {
  function removeTag() {
    remove(tag);
  }

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')} placement="top">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const content = props => (
    <Form
      {...props}
      type={type}
      tag={tag}
      renderButton={renderButton}
      tags={tags}
    />
  );

  return (
    <tr>
      <td>
        <TagWrapper space={space}>
          <Tags tags={[tag]} size="medium" />
        </TagWrapper>
      </td>
      <td>{tag.totalObjectCount || '-'}</td>
      <td>{count || '0'}</td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title="Edit tag"
            trigger={editTrigger}
            content={content}
          />

          <Tip text={__('Delete')} placement="top">
            <Button btnStyle="link" onClick={removeTag} icon="times-circle" />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;

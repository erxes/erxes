import React, { useState } from 'react';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormComponent from '@erxes/ui-tags/src/components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITag } from '@erxes/ui-tags/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import Label from '@erxes/ui/src/components/Label';
import Modal from 'react-bootstrap/Modal';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Select from 'react-select-plus';
import Tags from '@erxes/ui/src/components/Tags';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type RowProps = {
  tag: ITag;
  type: string;
  count?: number;
  space: number;
  types: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  merge: (sourceId: string, destId: string, callback) => void;
  tags: ITag[];
};

const Row: React.FC<RowProps> = ({
  tag,
  type,
  count,
  space,
  types,
  renderButton,
  remove,
  merge,
  tags
}) => {
  const [showMerge, setShowMerge] = useState(false);
  const [mergeDestination, setMergeDestination] = useState<
    | {
        value: string;
        label: string;
      }
    | undefined
  >(undefined);

  const removeTag = () => {
    remove(tag);
  };

  const toggleMergeWindow = () => {
    setShowMerge(!showMerge);
    setMergeDestination(undefined);
  };

  const onChangeDestination = (option: { value: string; label: string }) => {
    setMergeDestination(option);
  };

  const onMerge = () => {
    if (mergeDestination) {
      merge(tag._id, mergeDestination.value, () => {
        toggleMergeWindow();
      });
    }
  };

  const renderMergeWindow = () => {
    if (!showMerge) {
      return null;
    }

    const options: Array<{ value: string; label: string }> = [];

    for (const t of tags) {
      if (t._id === tag._id) {
        continue;
      }

      options.push({ value: t._id, label: t.name });
    }

    const renderInfo = () => {
      if (!mergeDestination) {
        return null;
      }

      return (
        <Info>
          <p>
            All associated {tag.type}(s) with the tag <b>{tag.name}</b> will be
            permanently merged into tag <b>{mergeDestination.label}</b>
          </p>
        </Info>
      );
    };

    return (
      <Modal show={true} onHide={toggleMergeWindow}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {__('Merge')} <b>{tag.name}</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {renderInfo()}

          <div>
            <label>{__('Destination')}:</label>

            <Select
              isRequired={true}
              value={mergeDestination ? mergeDestination.value : null}
              onChange={onChangeDestination}
              options={options}
            />
          </div>

          <Modal.Footer>
            <Button type="primary" onClick={onMerge}>
              {__('Merge')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    );
  };

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')} placement="top">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const content = (props: any) => (
    <FormComponent
      {...props}
      type={type}
      types={types}
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
        <Label lblStyle="default">{tag.type || '-'}</Label>
      </td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title="Edit tag"
            trigger={editTrigger}
            content={content}
          />

          {renderMergeWindow()}

          <Tip text={__('Merge')} placement="top">
            <Button btnStyle="link" onClick={toggleMergeWindow} icon="merge" />
          </Tip>

          <Tip text={__('Delete')} placement="top">
            <Button btnStyle="link" onClick={removeTag} icon="times-circle" />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;

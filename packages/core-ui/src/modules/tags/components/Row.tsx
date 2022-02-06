import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select-plus';
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
  merge: (sourceId: string, destId: string, callback) => void;
  tags: ITag[];
};

type State = {
  showMerge: boolean;
  mergeDestination?: { value: string; label: string };
};
class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showMerge: false };
  }

  removeTag = () => {
    const { remove, tag } = this.props;

    remove(tag);
  };

  toggleMergeWindow = () => {
    const { showMerge } = this.state;

    this.setState({ showMerge: !showMerge, mergeDestination: undefined });
  };

  onChangeDestination = option => {
    this.setState({ mergeDestination: option });
  };

  onMerge = () => {
    const { merge, tag } = this.props;
    const { mergeDestination } = this.state;

    if (mergeDestination) {
      merge(tag._id, mergeDestination.value, () => {
        this.toggleMergeWindow();
      });
    }
  };

  renderMergeWindow() {
    const { showMerge, mergeDestination } = this.state;
    const { tag, tags } = this.props;

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
      <Modal show={true} onHide={this.toggleMergeWindow}>
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
              onChange={this.onChangeDestination}
              options={options}
            />
          </div>

          <Modal.Footer>
            <Button type="primary" onClick={this.onMerge}>
              {__('Merge')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { tag, type, count, renderButton, space, tags } = this.props;

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

            {this.renderMergeWindow()}

            <Tip text={__('Merge')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.toggleMergeWindow}
                icon="merge"
              />
            </Tip>

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeTag}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;

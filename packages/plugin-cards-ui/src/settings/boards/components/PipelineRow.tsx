import { IPipeline } from '@erxes/ui-cards/src/boards/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import PipelineForm from '../containers/PipelineForm';
import { IOption } from '../types';
import Label from '@erxes/ui/src/components/Label';
import Icon from '@erxes/ui/src/components/Icon';
import { DateWrapper } from '@erxes/ui-forms/src/forms/styles';
import dayjs from 'dayjs';
import { Capitalize } from '@erxes/ui-settings/src/permissions/styles';

type Props = {
  pipeline: IPipeline;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (pipelineId: string) => void;
  archive: (pipelineId: string, status: string) => void;
  copied: (pipelineId: string) => void;
  onTogglePopup: () => void;
  type: string;
  options?: IOption;
};

type State = {
  showModal: boolean;
};

class PipelineRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  renderArchiveAction() {
    const { archive, pipeline } = this.props;

    if (pipeline.status === 'archived') {
      return null;
    }

    const onClick = () => archive(pipeline._id, pipeline.status);

    return (
      <Tip text={__('Archive')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
      </Tip>
    );
  }

  renderUnarchiveAction() {
    const { archive, pipeline } = this.props;

    if (!pipeline.status || pipeline.status === 'active') {
      return null;
    }

    const onClick = () => archive(pipeline._id, pipeline.status);

    return (
      <Tip text={__('Unarchive')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="redo" />
      </Tip>
    );
  }

  renderRemoveAction() {
    const { remove, pipeline } = this.props;

    const onClick = () => remove(pipeline._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  renderExtraLinks() {
    const { copied, pipeline } = this.props;

    const duplicate = () => copied(pipeline._id);

    const edit = () => {
      this.setState({ showModal: true });

      this.props.onTogglePopup();
    };

    return (
      <>
        <Tip text={__('Edit')} placement="top">
          <Button btnStyle="link" onClick={edit} icon="edit-3" />
        </Tip>
        <Tip text={__('Duplicate')} placement="top">
          <Button btnStyle="link" onClick={duplicate} icon="copy-1" />
        </Tip>
      </>
    );
  }

  renderEditForm() {
    const { renderButton, type, pipeline, options } = this.props;

    const closeModal = () => {
      this.setState({ showModal: false });

      this.props.onTogglePopup();
    };

    return (
      <PipelineForm
        options={options}
        type={type}
        boardId={pipeline.boardId || ''}
        renderButton={renderButton}
        pipeline={pipeline}
        closeModal={closeModal}
        show={this.state.showModal}
      />
    );
  }

  render() {
    const { pipeline } = this.props;
    const { createdUser } = pipeline;

    const labelStyle =
      !pipeline.status || pipeline.status === 'active' ? 'success' : 'warning';

    return (
      <tr>
        <td>{pipeline.name}</td>
        <td>
          <Label lblStyle={labelStyle}>{pipeline.status || 'active'}</Label>
        </td>
        <td>
          <DateWrapper>
            <Icon icon="calender" />{' '}
            {dayjs(pipeline.createdAt.toString().split('T')[0]).format('ll')}
          </DateWrapper>
        </td>
        <td>
          <Capitalize>
            {createdUser && createdUser.details && createdUser.details.fullName}
          </Capitalize>
        </td>
        <td>
          <ActionButtons>
            {this.renderExtraLinks()}
            {this.renderArchiveAction()}
            {this.renderUnarchiveAction()}
            {this.renderRemoveAction()}
            {this.renderEditForm()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PipelineRow;

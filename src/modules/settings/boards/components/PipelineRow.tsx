import { IPipeline } from 'modules/boards/types';
import { ActionButtons, Button, Tip } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { PipelineForm } from '../containers';
import { PipelineRowContainer } from '../styles';

type Props = {
  pipeline: IPipeline;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (pipelineId: string) => void;
  type: string;
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

  renderExtraLinks() {
    const { remove, pipeline } = this.props;

    const onClick = () => remove(pipeline._id);

    const edit = () => this.setState({ showModal: true });

    return (
      <ActionButtons>
        <Tip text="Edit">
          <Button btnStyle="link" onClick={edit} icon="edit" />
        </Tip>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
        </Tip>
      </ActionButtons>
    );
  }

  renderEditForm() {
    const { renderButton, type, pipeline } = this.props;

    const closeModal = () => this.setState({ showModal: false });

    return (
      <PipelineForm
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

    return (
      <PipelineRowContainer>
        <span>{pipeline.name}</span>
        {this.renderExtraLinks()}
        {this.renderEditForm()}
      </PipelineRowContainer>
    );
  }
}

export default PipelineRow;

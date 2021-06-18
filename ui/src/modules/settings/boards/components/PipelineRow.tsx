import { IPipeline } from 'modules/boards/types';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import PipelineForm from '../containers/PipelineForm';
import { IOption } from '../types';

type Props = {
  pipeline: IPipeline;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (pipelineId: string) => void;
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

  renderExtraLinks() {
    const { remove, pipeline } = this.props;

    const onClick = () => remove(pipeline._id);

    const edit = () => {
      this.setState({ showModal: true });

      this.props.onTogglePopup();
    };

    return (
      <>
        <Tip text="Edit" placement="top">
          <Button btnStyle="link" onClick={edit} icon="edit-3" />
        </Tip>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={onClick} icon="times-circle" />
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

    return (
      <tr>
        <td>{pipeline.name}</td>
        <td>
          <ActionButtons>
            {this.renderExtraLinks()}
            {this.renderEditForm()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PipelineRow;

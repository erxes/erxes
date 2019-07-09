import { IPipeline } from 'modules/boards/types';
import { collectOrders } from 'modules/boards/utils';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import SortableList from 'modules/common/components/SortableList';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import PipelineForm from '../containers/PipelineForm';
import { PipelineContainer } from '../styles';
import PipelineRow from './PipelineRow';

type Props = {
  type: string;
  pipelines: IPipeline[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (pipelineId: string) => void;
  boardId: string;
};

type State = {
  showModal: boolean;
  pipelines: IPipeline[];
  isDragDisabled: boolean;
};

class Pipelines extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false,
      pipelines: props.pipelines,
      isDragDisabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pipelines !== this.props.pipelines) {
      this.setState({ pipelines: nextProps.pipelines });
    }
  }

  renderAddForm = () => {
    const { boardId, renderButton, type } = this.props;

    const closeModal = () => this.setState({ showModal: false });

    return (
      <PipelineForm
        type={type}
        boardId={boardId}
        renderButton={renderButton}
        show={this.state.showModal}
        closeModal={closeModal}
      />
    );
  };

  addPipeline = () => {
    this.setState({
      showModal: true
    });
  };

  onChangePipelines = pipelines => {
    this.setState({ pipelines });

    this.props.updateOrder(collectOrders(pipelines));
  };

  onTogglePopup = () => {
    const { isDragDisabled } = this.state;

    this.setState({ isDragDisabled: !isDragDisabled });
  };

  renderRows() {
    const { renderButton, type } = this.props;

    const child = pipeline => {
      return (
        <PipelineRow
          key={pipeline._id}
          pipeline={pipeline}
          renderButton={renderButton}
          remove={this.props.remove}
          type={type}
          onTogglePopup={this.onTogglePopup}
        />
      );
    };

    const { pipelines } = this.state;

    return (
      <SortableList
        fields={pipelines}
        child={child}
        onChangeFields={this.onChangePipelines}
        isDragDisabled={this.state.isDragDisabled}
      />
    );
  }

  renderContent() {
    const { pipelines } = this.props;

    if (pipelines.length === 0) {
      return (
        <EmptyState
          size="full"
          text="Get started on your pipeline"
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <PipelineContainer>
        <h3>{__('Pipeline')}</h3>
        {this.renderRows()}
      </PipelineContainer>
    );
  }

  renderButton() {
    if (!this.props.boardId) {
      return null;
    }

    return (
      <Button
        btnStyle="success"
        size="small"
        icon="add"
        onClick={this.addPipeline}
      >
        Add pipeline
      </Button>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Wrapper.ActionBar
          left={
            <HeaderDescription
              icon="/images/actions/34.svg"
              title={'Boards & Pipelines'}
              description="Manage your boards and pipelines so that its easy to manage incoming leads or requests that is adaptable to your team's needs. Add in or delete boards and pipelines to keep business development on track and in check."
            />
          }
          right={this.renderButton()}
        />

        {this.renderContent()}
        {this.renderAddForm()}
      </React.Fragment>
    );
  }
}

export default Pipelines;

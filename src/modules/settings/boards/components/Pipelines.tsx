import { IPipeline } from 'modules/boards/types';
import { collectOrders } from 'modules/boards/utils';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import PipelineForm from '../containers/PipelineForm';
import { PipelineContainer } from '../styles';
import { IOption } from '../types';
import PipelineRow from './PipelineRow';

type Props = {
  type: string;
  pipelines: IPipeline[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (pipelineId: string) => void;
  boardId: string;
  options?: IOption;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
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
    const { boardId, renderButton, type, options } = this.props;

    const closeModal = () => this.setState({ showModal: false });

    return (
      <PipelineForm
        options={options}
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
    const { renderButton, type, options } = this.props;
    const { pipelines } = this.state;

    return pipelines.map(pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        renderButton={renderButton}
        remove={this.props.remove}
        type={type}
        options={options}
        onTogglePopup={this.onTogglePopup}
      />
    ));
  }

  renderContent() {
    const { pipelines, options } = this.props;
    const pipelineName = options ? options.pipelineName : 'pipeline';

    if (pipelines.length === 0) {
      return (
        <EmptyState
          size="full"
          text={`Get started on your ${pipelineName.toLowerCase()}`}
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <PipelineContainer>
        <h3>{__(pipelineName)}</h3>
        {this.renderRows()}
      </PipelineContainer>
    );
  }

  renderAdditionalButton = () => {
    const { options } = this.props;

    if (options && options.additionalButton) {
      return (
        <Link to={options.additionalButton}>
          <Button size="small" icon="arrow-to-right" btnStyle="primary">
            {options.additionalButtonText}
          </Button>
        </Link>
      );
    }

    return null;
  };

  renderButton() {
    const { options, boardId } = this.props;
    const pipelineName = options ? options.pipelineName : 'pipeline';

    if (!boardId) {
      return null;
    }

    return (
      <>
        {this.renderAdditionalButton()}
        <Button
          btnStyle="success"
          size="small"
          icon="add"
          onClick={this.addPipeline}
        >
          Add {pipelineName}
        </Button>
      </>
    );
  }

  render() {
    const { options } = this.props;
    const pipelineName = options ? options.pipelineName : 'Pipeline';
    const boardName = options ? options.boardName : 'Board';

    return (
      <>
        <Wrapper.ActionBar
          left={
            <HeaderDescription
              icon="/images/actions/34.svg"
              title={`${boardName} & ${pipelineName}`}
              description="Manage your boards and pipelines so that its easy to manage incoming leads or requests that is adaptable to your team's needs. Add in or delete boards and pipelines to keep business development on track and in check."
            />
          }
          right={this.renderButton()}
        />

        {this.renderContent()}
        {this.renderAddForm()}
      </>
    );
  }
}

export default Pipelines;

import { IBoard, IPipeline } from 'modules/boards/types';
import { collectOrders } from 'modules/boards/utils';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Table from 'modules/common/components/table';
import { Count, Title } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PipelineForm from '../containers/PipelineForm';
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
  currentBoard: IBoard;
} & IRouterProps;

type State = {
  showModal: boolean;
  pipelines: IPipeline[];
  isDragDisabled: boolean;
};

class Pipelines extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { history } = props;

    const showModal = history.location.hash.includes('showPipelineModal');

    this.state = {
      showModal,
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
          text={`Get started on your ${pipelineName.toLowerCase()}`}
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <>
        <Count>{pipelines.length} {__(pipelineName)}{pipelines.length > 1 && 's'}</Count>
        <Table>
          <thead>
            <tr>
              <th>{__(pipelineName)}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }

  renderAdditionalButton = () => {
    const { options } = this.props;

    if (options && options.additionalButton) {
      return (
        <Link to={options.additionalButton}>
          <Button uppercase={false} icon="arrow-to-right" btnStyle="simple">
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
          btnStyle="primary"
          uppercase={false}
          icon="plus-circle"
          onClick={this.addPipeline}
        >
          Add {pipelineName}
        </Button>
      </>
    );
  }

  render() {
    const leftActionBar = <Title>{this.props.currentBoard.name}</Title>;

    return (
      <>
        <Wrapper.ActionBar
          left={leftActionBar}
          right={this.renderButton()}
        />

        {this.renderContent()}
        {this.renderAddForm()}
      </>
    );
  }
}

export default withRouter(Pipelines);

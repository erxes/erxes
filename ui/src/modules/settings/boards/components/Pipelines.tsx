import { IBoard, IPipeline } from 'modules/boards/types';
import { collectOrders } from 'modules/boards/utils';
import Button from 'modules/common/components/Button';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import EmptyState from 'modules/common/components/EmptyState';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import FormControl from 'modules/common/components/form/Control';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import {
  EMPTY_CONTENT_DEAL_PIPELINE,
  EMPTY_CONTENT_TASK_PIPELINE
} from 'modules/settings/constants';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PipelineForm from '../containers/PipelineForm';
import { IOption } from '../types';
import { PipelineCount } from '../styles';
import PipelineRow from './PipelineRow';
import SortHandler from 'modules/common/components/SortHandler';

type Props = {
  type: string;
  pipelines: IPipeline[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (pipelineId: string) => void;
  archive: (pipelineId: string, status: string) => void;
  copied: (pipelineId: string) => void;
  boardId: string;
  options?: IOption;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
  currentBoard?: IBoard;
} & IRouterProps;

type State = {
  showModal: boolean;
  pipelines: IPipeline[];
  isDragDisabled: boolean;
  searchValue: string;
};

const sortItems = (arr, direction, field) => {
  if (!field || !direction) {
    return;
  }

  arr.sort((a, b) => {
    const valueA = a[field].toLowerCase();
    const valueB = b[field].toLowerCase();

    if (valueA < valueB) {
      return -direction;
    }

    if (valueA > valueB) {
      return direction;
    }

    return 0;
  });
};

class Pipelines extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { history } = props;

    const showModal = history.location.hash.includes('showPipelineModal');

    this.state = {
      showModal,
      pipelines: props.pipelines,
      isDragDisabled: false,
      searchValue: ''
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

  searchHandler = event => {
    const searchValue = event.target.value.toLowerCase();
    const { history, pipelines } = this.props;

    router.setParams(history, { searchValue: event.target.value });

    let updatedPipelines = pipelines;

    if (searchValue) {
      updatedPipelines = pipelines.filter(p =>
        p.name.toLowerCase().includes(searchValue)
      );
    }

    this.setState({ pipelines: updatedPipelines });
  };

  renderRows() {
    const { renderButton, type, options, history } = this.props;
    const { pipelines } = this.state;

    const sortDirection = router.getParam(history, 'sortDirection');
    const sortField = router.getParam(history, 'sortField');

    const sortedPipelines = [...pipelines];

    if (sortDirection && sortField) {
      sortItems(sortedPipelines, sortDirection, sortField);
    }

    return sortedPipelines.map(pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        renderButton={renderButton}
        remove={this.props.remove}
        archive={this.props.archive}
        copied={this.props.copied}
        type={type}
        options={options}
        onTogglePopup={this.onTogglePopup}
      />
    ));
  }

  renderContent() {
    const { pipelines, options, type } = this.props;

    const pipelineName = options ? options.pipelineName : 'pipeline';

    if (pipelines.length === 0) {
      if (type === 'deal' || type === 'task') {
        return (
          <EmptyContent
            content={
              type === 'deal'
                ? EMPTY_CONTENT_DEAL_PIPELINE
                : EMPTY_CONTENT_TASK_PIPELINE
            }
            maxItemWidth="420px"
          />
        );
      }

      return (
        <EmptyState
          text={`Get started on your ${pipelineName.toLowerCase()}`}
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'name'} label={__('pipelineName')} />
            </th>
            <th>{__('Status')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created By')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows()}</tbody>
      </Table>
    );
  }

  renderAdditionalButton = () => {
    const { options } = this.props;

    if (options && options.additionalButton) {
      return (
        <Link to={options.additionalButton}>
          <Button icon="arrow-to-right" btnStyle="simple">
            {options.additionalButtonText}
          </Button>
        </Link>
      );
    }

    return null;
  };

  renderButton() {
    const { options, boardId, history } = this.props;
    const pipelineName = options ? options.pipelineName : 'pipeline';

    if (!boardId) {
      return null;
    }

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.searchHandler}
          value={router.getParam(history, 'searchValue')}
          autoFocus={true}
        />

        {this.renderAdditionalButton()}
        <Button
          btnStyle="success"
          icon="plus-circle"
          onClick={this.addPipeline}
        >
          Add {pipelineName}
        </Button>
      </BarItems>
    );
  }

  render() {
    const { currentBoard, pipelines, options } = this.props;
    const pipelineName = options ? options.pipelineName : 'pipeline';

    const leftActionBar = (
      <Title>
        {currentBoard ? currentBoard.name : ''}

        <PipelineCount>
          ({pipelines.length} {__(pipelineName)}
          {pipelines.length > 1 && 's'})
        </PipelineCount>
      </Title>
    );

    return (
      <div id="pipelines-content">
        <Wrapper.ActionBar left={leftActionBar} right={this.renderButton()} />
        {this.renderContent()}
        {this.renderAddForm()}
      </div>
    );
  }
}

export default withRouter(Pipelines);

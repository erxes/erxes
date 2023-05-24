import {
  EMPTY_CONTENT_DEAL_PIPELINE,
  EMPTY_CONTENT_TASK_PIPELINE,
  EMPTY_CONTENT_PURCHASE_PIPELINE
} from '@erxes/ui-settings/src/constants';
import { IBoard, IPipeline } from '@erxes/ui-cards/src/boards/types';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { Link, withRouter } from 'react-router-dom';
import { __, router } from 'coreui/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IOption } from '../types';
import { PipelineCount } from '@erxes/ui-cards/src/settings/boards/styles';
import PipelineForm from '../containers/PipelineForm';
import PipelineRow from './PipelineRow';
import React from 'react';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { collectOrders } from '@erxes/ui-cards/src/boards/utils';
import CostForm from './CostForm';
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

      if (type === 'purchase') {
        return (
          <EmptyContent
            content={
              type === 'purchase'
                ? EMPTY_CONTENT_PURCHASE_PIPELINE
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
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
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
    if (options && options.modal === 'true') {
      return <CostForm />;
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
        <Wrapper.ActionBar
          wideSpacing
          left={leftActionBar}
          right={this.renderButton()}
        />
        {this.renderContent()}
        {this.renderAddForm()}
      </div>
    );
  }
}

export default withRouter(Pipelines);

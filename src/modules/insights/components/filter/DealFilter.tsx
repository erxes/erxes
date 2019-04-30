import { Button, ControlLabel } from 'modules/common/components';
import { ISelectedOption } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { IBoard, IPipeline } from 'modules/deals/types';
import * as React from 'react';
import Select from 'react-select-plus';
import { FlexItem } from '../../styles';
import { IQueryParams } from '../../types';
import { selectOptions } from '../../utils';
import Filter from './Filter';

type Props = {
  queryParams: IQueryParams;
  history: any;
  pipelines: IPipeline[];
  boards: IBoard[];
};

type States = {
  boardId: string;
  pipelineIds: string[];
};

class DealFilter extends React.Component<Props, States> {
  constructor(props) {
    super(props);

    const { boardId = '', pipelineIds = '' } = props.queryParams || {};

    this.state = {
      boardId,
      pipelineIds: pipelineIds.split(','),
      ...props.queryParams
    };
  }

  onPipelineChange = (pipelines: ISelectedOption[]) => {
    this.setState({ pipelineIds: pipelines.map(el => el.value) });
  };

  onBoardChange = (board: ISelectedOption) => {
    this.setState({ boardId: board && board.value });

    const { history } = this.props;
    router.setParams(history, {
      pipelineIds: '',
      boardId: board && board.value
    });
  };

  onApplyClick = ({ startDate, endDate }) => {
    const { history } = this.props;
    const { pipelineIds, boardId } = this.state;

    router.setParams(history, {
      pipelineIds: (pipelineIds || []).join(','),
      boardId,
      startDate,
      endDate
    });
  };

  renderPipelines() {
    const { pipelines } = this.props;

    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <FlexItem>
        <ControlLabel>{__('Pipelines')}</ControlLabel>

        <Select
          placeholder={__('Choose pipelines')}
          value={this.state.pipelineIds || []}
          onChange={this.onPipelineChange}
          optionRenderer={options}
          options={selectOptions([...pipelines])}
          multi={true}
        />
      </FlexItem>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <FlexItem>
        <ControlLabel>{__('Boards')}</ControlLabel>

        <Select
          placeholder={__('Choose board')}
          value={this.state.boardId || ''}
          onChange={this.onBoardChange}
          optionRenderer={options}
          options={selectOptions([{ _id: '', name: __('All') }, ...boards])}
        />
      </FlexItem>
    );
  }

  render() {
    const { queryParams, history } = this.props;

    const content = (
      <>
        {this.renderBoards()}
        {this.renderPipelines()}
      </>
    );

    return (
      <Filter
        queryParams={queryParams}
        history={history}
        content={content}
        onApplyClick={this.onApplyClick}
      />
    );
  }
}

export default DealFilter;

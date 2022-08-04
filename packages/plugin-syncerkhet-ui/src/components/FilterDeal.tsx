import {
  ControlLabel,
  Button,
  FormGroup,
  DateControl,
  __,
  Table,
  DataWithLoader
} from '@erxes/ui/src';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { MainStyleDateContainer as DateContainer } from '@erxes/ui/src/styles/eindex';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
type Props = {
  config: any;
};
type State = {
  configs: any;
};
class FilterDeals extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  config = {
    boardId: '',
    pipelineId: '',
    stageId: ''
  };
  onChangeBoard = (boardId: string) => {
    // this.setState({ config: { ...this.state.config, boardId } });
    this.config.boardId = boardId;
  };

  onChangePipeline = (pipelineId: string) => {
    // this.setState({ config: { ...this.state.config, pipelineId } });
    this.config.pipelineId = pipelineId;
  };

  onChangeStage = (stageId: string) => {
    // this.setState({ config: { ...this.state.config, stageId } });
    this.config.stageId = stageId;
  };
  render() {
    // const { checked, deals, loading } = this.props;

    const tablehead = ['Board name', 'Pipeline name', 'Stage Name', 'Amount'];

    // if (loading) {
    //   return <Spinner />;
    // }

    const Content = (
      <Table>
        <thead>
          <tr>
            <th>Deal name</th>
            <th>Amount</th>
            <th>Checked?</th>
            {/* {tablehead.map(p => (
              <th key={p}>{p}</th>
            ))} */}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>td</td>
            <td>td</td>
            <td>td</td>
          </tr>
          <tr>
            <td>td</td>
            <td>td</td>
            <td>td</td>
          </tr>
        </tbody>
      </Table>
    );

    const header = <Wrapper.Header title={__('Check deals') + `(${1})`} />;

    const sideDealFilter = (
      <>
        <FormGroup>
          <ControlLabel>Choose Stage</ControlLabel>
          <BoardSelectContainer
            type="deal"
            autoSelectStage={false}
            boardId={this.config.boardId}
            pipelineId={this.config.pipelineId}
            stageId={this.config.stageId}
            onChangeBoard={this.onChangeBoard}
            onChangePipeline={this.onChangePipeline}
            onChangeStage={this.onChangeStage}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose Start Date</ControlLabel>
          <DateContainer>
            <DateControl
              required={true}
              name="startDate"
              placeholder={__('Start date')}
              // value={voucherCampaign.startDate}
              // onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose End Date</ControlLabel>
          <DateContainer>
            <DateControl
              required={true}
              name="endDate"
              placeholder={__('End date')}
              // value={voucherCampaign.startDate}
              // onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </DateContainer>
        </FormGroup>
        <Button btnStyle="primary" icon="check-circle">
          Search
        </Button>
      </>
    );
    const sidebar = (
      <Sidebar children={sideDealFilter} />
      // <Sidebar
      //   loadingMainQuery={loading}
      //   queryParams={queryParams}
      //   history={history}
      //   refetch={refetch}
      // />
    );

    const content = (
      <>
        <Wrapper.ActionBar
          left={<Title>Deals</Title>}
          //   right={<ScoreFormContainer />}
        />
        <DataWithLoader
          data={Content}
          // count={20}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      </>
    );

    return (
      <Wrapper
        header={header}
        leftSidebar={sidebar}
        content={content}
        // footer={<Pagination count={total}/>}
      />
    );
  }
}
export default FilterDeals;

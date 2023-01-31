import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import FormControl from '@erxes/ui/src/components/form/Control';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
}

interface State {
  boardId: string;
  pipelineId: string;
  stageId: string;
  configStageId: string;
  stageChangedStartDate: Date;
  stageChangedEndDate: Date;
  userId: string;
  dateType: string;
}

class CheckerSidebar extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { queryParams } = this.props;
    this.state = {
      userId: queryParams.userId,
      boardId: queryParams.boardId,
      pipelineId: queryParams.pipelineId,
      stageId: queryParams.stageId,
      configStageId: queryParams.configStageId,
      stageChangedStartDate: queryParams.stageChangedStartDate,
      stageChangedEndDate: queryParams.stageChangedEndDate,
      dateType: queryParams.dateType
    };
  }

  clearCategoryFilter = () => {
    router.setParams(this.props.history, {
      ownerId: null,
      ownerType: null,
      status: null,
      voucherCampaignId: null
    });
  };

  setFilter = (name, value) => {
    router.setParams(this.props.history, { [name]: value });
  };

  onFilter = () => {
    const {
      boardId,
      pipelineId,
      stageId,
      configStageId,
      userId,
      stageChangedStartDate,
      stageChangedEndDate,
      dateType
    } = this.state;

    router.setParams(this.props.history, {
      page: 1,
      boardId,
      pipelineId,
      stageId,
      configStageId,
      userId,
      stageChangedStartDate,
      stageChangedEndDate,
      dateType
    });
  };

  onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    this.setState({ [kind]: cDate } as any);
  };

  renderRange(dateType: string) {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={this.state[lblStart] || null}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={this.onChangeRangeFilter.bind(this, lblStart)}
            viewMode={'days'}
            className={'filterDate'}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={this.state[lblEnd]}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={this.onChangeRangeFilter.bind(this, lblEnd)}
            viewMode={'days'}
            className={'filterDate'}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    const {
      boardId,
      pipelineId,
      stageId,
      userId,
      configStageId,
      dateType
    } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.setState({ boardId });
    };

    const onChangePipeline = (pipelineId: string) => {
      this.setState({ pipelineId });
    };

    const onChangeStage = (stageId: string) => {
      this.setState({ stageId });
    };

    const onChangeConfigStage = (stageId: string) => {
      this.setState({ configStageId: stageId });
    };

    const onUserChange = userId => {
      this.setState({ userId });
    };

    const onChangeType = (e: React.FormEvent<HTMLElement>) => {
      this.setState({
        dateType: (e.currentTarget as HTMLInputElement).value
      });
    };

    return (
      <Wrapper.Sidebar>
        <Sidebar>
          <Section collapsible={false}>
            <Section.Title>{__('Filters')}</Section.Title>

            <FormGroup>
              <ControlLabel>Choose Filter Stage</ControlLabel>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={boardId || ''}
                pipelineId={pipelineId || ''}
                stageId={stageId || ''}
                onChangeBoard={onChangeBoard}
                onChangePipeline={onChangePipeline}
                onChangeStage={onChangeStage}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Assigned</ControlLabel>
              <SelectTeamMembers
                label="Choose users"
                name="userId"
                customOption={{ label: 'Choose user', value: '' }}
                initialValue={userId || ''}
                onSelect={onUserChange}
                multi={false}
              />
            </FormGroup>

            {this.renderRange('stageChanged')}
            <FormGroup>
              <ControlLabel>Choose Get Config Stage</ControlLabel>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={boardId || ''}
                pipelineId={pipelineId || ''}
                stageId={configStageId || stageId || ''}
                onChangeBoard={onChangeBoard}
                onChangePipeline={onChangePipeline}
                onChangeStage={onChangeConfigStage}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Date type</ControlLabel>
              <FormControl
                componentClass="select"
                value={dateType}
                name="dateType"
                onChange={onChangeType}
              >
                <option value={''}>Now</option>
                <option value={'lastMove'}>Last move at</option>
                <option value={'created'}>Created At</option>
                <option value={'closeOrCreated'}>
                  Close date or created at
                </option>
                <option value={'closeOrMove'}>
                  Close date or last move at
                </option>
                <option value={'firstOrMove'}>
                  First synced or last move at
                </option>
                <option value={'firstOrCreated'}>
                  First synced or created at
                </option>
              </FormControl>
            </FormGroup>
          </Section>

          <Button onClick={this.onFilter}>Filter</Button>
        </Sidebar>
      </Wrapper.Sidebar>
    );
  }
}

export default CheckerSidebar;

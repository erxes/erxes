import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
}

interface State {
  boardId: string;
  pipelineId: string;
  stageId: string;
  stageChangedStartDate: Date;
  stageChangedEndDate: Date;
}

class CheckerSidebar extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    const { queryParams } = this.props;
    this.state = {
      boardId: queryParams.boardId,
      pipelineId: queryParams.pipelineId,
      stageId: queryParams.stageId,
      stageChangedStartDate: queryParams.stageChangedStartDate,
      stageChangedEndDate: queryParams.stageChangedEndDate
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
      stageChangedStartDate,
      stageChangedEndDate
    } = this.state;

    router.setParams(this.props.history, {
      page: 1,
      boardId,
      pipelineId,
      stageId,
      stageChangedStartDate,
      stageChangedEndDate
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
    const { boardId, pipelineId, stageId } = this.state;

    const onChangeBoard = (boardId: string) => {
      this.setState({ boardId });
    };

    const onChangePipeline = (pipelineId: string) => {
      this.setState({ pipelineId });
    };

    const onChangeStage = (stageId: string) => {
      this.setState({ stageId });
    };

    return (
      <Wrapper.Sidebar hasBorder>
        <Sidebar hasBorder>
          <Section maxHeight={188} collapsible={false}>
            <Section.Title>
              {__('Filters')}
              <Section.QuickButtons>
                {(router.getParam(history, 'status') ||
                  router.getParam(history, 'ownerType') ||
                  router.getParam(history, 'ownerID') ||
                  router.getParam(history, 'voucherCampaignId')) && (
                  <a
                    href="#cancel"
                    tabIndex={0}
                    onClick={this.clearCategoryFilter}
                  >
                    <Tip text={__('Clear filter')} placement="bottom">
                      <Icon icon="cancel-1" />
                    </Tip>
                  </a>
                )}
              </Section.QuickButtons>
            </Section.Title>

            <FormGroup>
              <ControlLabel>Stage</ControlLabel>
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

            {this.renderRange('stageChanged')}
          </Section>

          <Button onClick={this.onFilter}>Filter</Button>
        </Sidebar>
      </Wrapper.Sidebar>
    );
  }
}

export default CheckerSidebar;

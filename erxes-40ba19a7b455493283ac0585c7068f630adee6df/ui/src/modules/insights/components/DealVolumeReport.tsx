import Spinner from 'modules/common/components/Spinner';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { INSIGHT_TYPES } from '../constants';
import DealFilter from '../containers/DealFilter';
import {
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper,
  LoaderWrapper
} from '../styles';
import {
  IChartParams,
  IPunchCardData,
  IQueryParams,
  SummaryData
} from '../types';
import Chart from './Chart';
import PunchCard from './PunchCard';
import Sidebar from './Sidebar';
import Summary from './Summary';
import TeamMembers from './TeamMembers';

type loadingType = {
  main: boolean;
  punch: boolean;
  teamMember: boolean;
};

type Props = {
  queryParams: IQueryParams;
  history: any;
  punch: IPunchCardData[];
  trend: IChartParams[];
  summary: SummaryData[];
  loading: loadingType;
  teamMembers: IChartParams[];
};

class DealVolumeReport extends React.Component<Props, { width: number }> {
  private wrapper;

  constructor(props) {
    super(props);

    this.state = {
      width: 600
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading.main && !this.props.loading.main) {
      this.calculateWidth();
    }
  }

  componentDidMount() {
    this.calculateWidth();
  }

  calculateWidth() {
    const width = this.wrapper.clientWidth;
    this.setState({ width });
  }

  renderTitle(title: string, time?: string) {
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderTrend(name, loading, data) {
    return (
      <InsightRow>
        {this.renderTitle(name)}
        <Chart loading={loading.main} height={360} data={data} />
      </InsightRow>
    );
  }

  renderPunchCard(loading, data, width) {
    let content = (
      <LoaderWrapper>
        <Spinner objective={true} />
      </LoaderWrapper>
    );

    if (!loading.punch) {
      content = <PunchCard data={data} width={width} />;
    }

    return (
      <InsightRow>
        {this.renderTitle('Punch card')}
        {content}
      </InsightRow>
    );
  }

  renderTeamMembers() {
    const { teamMembers, loading } = this.props;

    if (!teamMembers) {
      return null;
    }

    return (
      <InsightRow>
        <InsightTitle>Team Members</InsightTitle>
        <TeamMembers
          loading={loading.teamMember || false}
          datas={teamMembers || []}
        />
      </InsightRow>
    );
  }

  renderCharts() {
    const { trend, summary, punch, loading } = this.props;

    const width = this.state.width;

    const innerRef = node => {
      this.wrapper = node;
    };

    return (
      <InsightContent innerRef={innerRef}>
        <InsightRow>
          {this.renderTitle('Volume summary')}
          <Summary loading={loading.main} data={summary} />
        </InsightRow>

        {this.renderTrend('Volume Trend', loading, trend)}

        {this.renderPunchCard(loading, punch, width)}

        {this.renderTeamMembers()}
      </InsightContent>
    );
  }

  renderContent() {
    const { history, queryParams } = this.props;

    return (
      <InsightWrapper>
        <DealFilter history={history} queryParams={queryParams} />
        {this.renderCharts()}
      </InsightWrapper>
    );
  }

  render() {
    return (
      <Wrapper
        header={<Wrapper.Header title={__('Insights')} submenu={menuDeal} />}
        leftSidebar={
          <Sidebar
            queryParams={this.props.queryParams}
            type={INSIGHT_TYPES.DEAL}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default DealVolumeReport;

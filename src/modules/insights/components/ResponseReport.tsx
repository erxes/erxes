import Spinner from 'modules/common/components/Spinner';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IBrand } from '../../settings/brands/types';
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
import InboxFilter from './filter/InboxFilter';
import PunchCard from './PunchCard';
import Sidebar from './Sidebar';
import Summary from './Summary';

type ILoading = {
  summaryData: boolean;
  trend: boolean;
  punchCard: boolean;
};

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
  summaryData: SummaryData[];
  trend: IChartParams[];
  punchCard: IPunchCardData[];
  loading: ILoading;
};

class ResponseReport extends React.Component<Props, { width: number }> {
  private wrapper;

  constructor(props) {
    super(props);

    this.state = {
      width: 600
    };
  }

  calculateWidth() {
    const width = this.wrapper.clientWidth;
    this.setState({ width });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading.punch && !this.props.loading.punchCard) {
      this.calculateWidth();
    }
  }

  componentDidMount() {
    this.calculateWidth();
  }

  renderTitle(title: string, time?: string) {
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderTrend(name: string, loading: boolean, trend: IChartParams[]) {
    const innerRef = node => {
      this.wrapper = node;
    };

    return (
      <InsightRow innerRef={innerRef}>
        {this.renderTitle(name)}
        <Chart loading={loading} height={360} data={trend} />
      </InsightRow>
    );
  }

  renderPunchCard(loading: ILoading, punch: IPunchCardData[], width: number) {
    let content = (
      <LoaderWrapper>
        <Spinner objective={true} />
      </LoaderWrapper>
    );

    if (!loading.punchCard) {
      content = <PunchCard data={punch} width={width} />;
    }

    return (
      <InsightRow>
        {this.renderTitle('Punch card')}
        {content}
      </InsightRow>
    );
  }

  renderCharts() {
    const { trend, punchCard, summaryData, loading } = this.props;

    const width = this.state.width;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle('Response Times summary')}
          <Summary loading={loading.summaryData} data={summaryData} />
        </InsightRow>

        {this.renderTrend('Response Trend', loading.trend, trend)}

        {this.renderPunchCard(loading, punchCard, width)}
      </InsightContent>
    );
  }

  renderContent() {
    const { brands, history, queryParams } = this.props;

    return (
      <InsightWrapper>
        <InboxFilter
          history={history}
          brands={brands}
          queryParams={queryParams}
        />
        {this.renderCharts()}
      </InsightWrapper>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Response Report')} submenu={menuInbox} />
        }
        leftSidebar={<Sidebar queryParams={this.props.queryParams} />}
        content={this.renderContent()}
      />
    );
  }
}

export default ResponseReport;

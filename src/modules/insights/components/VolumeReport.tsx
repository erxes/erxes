import { Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  FlexRow,
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper,
  LoaderWrapper
} from '../styles';
import {
  IChartParams,
  IPieChartData,
  IPunchCardData,
  IQueryParams,
  SummaryData
} from '../types';
import { Chart, Insights, PunchCard, Sidebar, Summary } from './';
import InboxFilter from './filter/InboxFilter';

type loadingType = {
  punchCard: boolean;
  summaryData: boolean;
  trend: boolean;
  integrationChart: boolean;
  tagChart: boolean;
};

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
  loading: loadingType;
  summaryData: SummaryData[];
  trend: IChartParams[];
  punchCard: IPunchCardData[];
  integrationChart: IPieChartData[];
  tagChart: IPieChartData[];
};

class VolumeReport extends React.Component<Props, { width: number }> {
  private wrapper;

  constructor(props) {
    super(props);

    this.state = {
      width: 600
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading.trend && !this.props.loading.trend) {
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

  renderTrend(name: string, loading: boolean, data: IChartParams[]) {
    return (
      <InsightRow>
        {this.renderTitle(name)}
        <Chart loading={loading} height={360} data={data} />
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

  renderCharts() {
    const {
      trend,
      punchCard,
      integrationChart,
      tagChart,
      summaryData,
      loading
    } = this.props;

    const width = this.state.width;

    const innerRef = node => {
      this.wrapper = node;
    };

    return (
      <InsightContent innerRef={innerRef}>
        <InsightRow>
          {this.renderTitle('Volume summary')}
          <Summary loading={loading.summaryData} data={summaryData} />
        </InsightRow>

        {this.renderTrend('Volume Trend', loading.trend, trend)}

        {this.renderPunchCard(loading, punchCard, width)}

        <InsightRow>
          <FlexRow>
            <Insights
              title="Integrations"
              loading={loading.integrationChart}
              data={integrationChart || []}
            />
            <Insights
              title="Tags"
              loading={loading.tagChart}
              data={tagChart || []}
            />
          </FlexRow>
        </InsightRow>
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
          <Wrapper.Header title={__('Volume Report')} submenu={menuInbox} />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default VolumeReport;

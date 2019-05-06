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
  InsightData,
  IPunchCardData,
  IQueryParams,
  SummaryData
} from '../types';
import { Chart, Insights, PunchCard, Sidebar, Summary } from './';
import InboxFilter from './filter/InboxFilter';

type loadingType = {
  punch: boolean;
  summary: boolean;
  trend: boolean;
  insights: boolean;
};

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  punch: IPunchCardData[];
  summary: SummaryData[];
  loading: loadingType;
  insights: InsightData;
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
    if (prevProps.loading.insights && !this.props.loading.insights) {
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

  renderTrend(name, loading, trend) {
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

  renderPunchCard(loading, punch, width) {
    let content = (
      <LoaderWrapper>
        <Spinner objective={true} />
      </LoaderWrapper>
    );

    if (!loading.punch) {
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
    const { trend, punch, insights, summary, loading } = this.props;

    const width = this.state.width;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle('Volume summary')}
          <Summary loading={loading.summary} data={summary} />
        </InsightRow>

        {this.renderTrend('Volume Trend', loading.trend, trend)}

        {this.renderPunchCard(loading, punch, width)}

        <InsightRow>
          {this.renderTitle('Insights')}
          <FlexRow>
            <Insights
              loading={loading.insights}
              data={insights.integration || []}
            />
            <Insights loading={loading.insights} data={insights.tag || []} />
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
        header={<Wrapper.Header submenu={menuInbox} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default VolumeReport;

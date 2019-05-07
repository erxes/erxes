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
  punch: boolean;
  summary: boolean;
  trend: boolean;
  integrations: boolean;
  tags: boolean;
};

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  punch: IPunchCardData[];
  summary: SummaryData[];
  loading: loadingType;
  integrations: IPieChartData[];
  tags: IPieChartData[];
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

  renderTrend(name, loading, data) {
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
    const { trend, punch, integrations, tags, summary, loading } = this.props;

    const width = this.state.width;

    const innerRef = node => {
      this.wrapper = node;
    };

    return (
      <InsightContent innerRef={innerRef}>
        <InsightRow>
          {this.renderTitle('Volume summary')}
          <Summary loading={loading.summary} data={summary} />
        </InsightRow>

        {this.renderTrend('Volume Trend', loading.trend, trend)}

        {this.renderPunchCard(loading, punch, width)}

        <InsightRow>
          <FlexRow>
            <Insights
              title="Integrations"
              loading={loading.integrations}
              data={integrations || []}
            />
            <Insights title="Tags" loading={loading.tags} data={tags || []} />
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

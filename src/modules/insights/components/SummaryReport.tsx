import { Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper
} from '../styles';
import { IChartParams, IQueryParams, SummaryData } from '../types';
import { Chart, InboxFilter, Sidebar, Summary } from './';

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  summary: SummaryData[];
  loading: boolean;
};

class SummaryReport extends React.Component<Props, { width: number }> {
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

  renderTrend(name, loading, trend) {
    const innerRef = node => {
      this.wrapper = node;
    };

    return (
      <InsightRow innerRef={innerRef}>
        {this.renderTitle(name)}
        <Chart loading={loading.main} height={360} data={trend} />
      </InsightRow>
    );
  }

  renderBreadCrumnb() {
    return [
      { title: __('Insights'), link: '/inbox/insights' },
      { title: __('Response Report') }
    ];
  }

  renderCharts() {
    const { trend, summary, loading } = this.props;

    const width = this.state.width;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle('Response Times summary')}
          <Summary loading={loading} data={summary} />
        </InsightRow>

        {this.renderTrend('Response Trend', loading, trend)}
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
          <Wrapper.Header
            breadcrumb={this.renderBreadCrumnb()}
            submenu={menuInbox}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default SummaryReport;

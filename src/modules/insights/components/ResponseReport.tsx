import { Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper,
  LoaderWrapper
} from '../styles';
import { IChartParams, IQueryParams } from '../types';
import { Chart, Filter, PunchCard, Sidebar, Summary, TeamMembers } from './';

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  teamMembers?: IChartParams[];
  punch?: any;
  summary?: any;
  loading?: any;
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
    if (prevProps.loading.punch && !this.props.loading.punch) {
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

  renderTrend(name, loading, trend, width) {
    return (
      <InsightRow
        innerRef={node => {
          this.wrapper = node;
        }}
      >
        {this.renderTitle(name)}
        <Chart loading={loading.main} height={360} data={trend} />
      </InsightRow>
    );
  }

  renderPunchCard(loading, punch, width) {
    let content = (
      <LoaderWrapper>
        <Spinner objective />
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

  renderBreadCrumnb() {
    return [
      { title: __('Insights'), link: '/insights' },
      { title: __('Response Report') }
    ];
  }

  renderCharts() {
    const { trend, teamMembers, punch, summary, loading } = this.props;

    const width = this.state.width;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle('Response Times summary')}
          <Summary loading={loading.main} data={summary} />
        </InsightRow>

        {this.renderTrend('Response Trend', loading, trend, width)}

        {this.renderPunchCard(loading, punch, width)}

        <InsightRow>
          {this.renderTitle('Response by team members')}
          <TeamMembers loading={loading.main} datas={teamMembers || []} />
        </InsightRow>
      </InsightContent>
    );
  }

  renderContent() {
    const { brands, history, queryParams } = this.props;

    return (
      <InsightWrapper>
        <Filter history={history} brands={brands} queryParams={queryParams} />
        {this.renderCharts()}
      </InsightWrapper>
    );
  }

  render() {
    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.renderBreadCrumnb()} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default ResponseReport;

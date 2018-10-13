import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper
} from '../styles';
import { IChartParams, IQueryParams } from '../types';
import { convertTime } from '../utils';
import { Chart, Filter, Sidebar, TeamMembers } from './';

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  teamMembers?: IChartParams[];
  time?: number;
  isLoading?: boolean;
};

class ResponseCloseReport extends React.Component<Props> {
  renderTitle(title: string, time?: string) {
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderBreadCrumnb() {
    return [
      { title: __('Insights'), link: '/insights' },
      { title: __('Response Close Report') }
    ];
  }

  renderCharts() {
    const { trend, teamMembers, time, isLoading } = this.props;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle(
            'Daily Response Close Resolve Rate',
            convertTime(time)
          )}
          <Chart loading={isLoading} height={300} data={trend} />
        </InsightRow>

        <InsightRow>
          {this.renderTitle(
            'Daily Response Close Resolve Rate by Team Members',
            convertTime(time)
          )}
          <TeamMembers loading={isLoading || false} datas={teamMembers || []} />
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

export default ResponseCloseReport;

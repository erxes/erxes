import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  InsightContent,
  InsightRow,
  InsightTitle,
  InsightWrapper
} from '../styles';
import { IChartParams, IQueryParams } from '../types';
import { convertTime } from '../utils';
import Chart from './Chart';
import InboxFilter from './filter/InboxFilter';
import Sidebar from './Sidebar';
import Summary from './Summary';
import TeamMembers from './TeamMembers';

type Props = {
  brands: IBrand[];
  trend: IChartParams[];
  queryParams: IQueryParams;
  history: any;
  teamMembers?: IChartParams[];
  time?: number;
  isLoading: boolean;
  summaries: number[];
};

class FirstResponse extends React.Component<Props> {
  renderTitle(title: string, time?: string) {
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderCharts() {
    const { trend, teamMembers, time, isLoading, summaries } = this.props;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle(
            'Daily First Response Resolve Rate',
            convertTime(time)
          )}

          <Summary loading={isLoading} data={summaries} />

          <Chart loading={isLoading} height={300} data={trend} />
        </InsightRow>

        <InsightRow>
          {this.renderTitle(
            'Daily First Response Resolve Rate by Team Members',
            convertTime(time)
          )}
          <TeamMembers loading={isLoading} datas={teamMembers || []} />
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
          <Wrapper.Header
            title={__('First Response Report')}
            submenu={menuInbox}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default FirstResponse;

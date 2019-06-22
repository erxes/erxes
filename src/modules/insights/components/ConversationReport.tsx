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
import { Chart, InboxFilter, Sidebar, Summary, TeamMembers } from './';

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
  conversationCustomerAvg: SummaryData[];
  conversationInternalAvg: SummaryData[];
  conversationOverallAvg: SummaryData[];
  conversationReport: {
    avg: SummaryData[];
    trend: IChartParams[];
    teamMembers: IChartParams[];
  };
  loading: boolean;
};

class ConversationReport extends React.Component<Props, { userId: string }> {
  constructor(props) {
    super(props);

    this.state = { userId: '' };
  }

  renderContent() {
    const {
      brands,
      history,
      queryParams,
      conversationCustomerAvg,
      conversationInternalAvg,
      conversationOverallAvg,
      conversationReport,
      loading
    } = this.props;

    const combinedData = Array.prototype.concat(
      ...[
        conversationReport.avg,
        conversationCustomerAvg,
        conversationInternalAvg,
        conversationOverallAvg
      ]
    );

    return (
      <InsightWrapper>
        <InboxFilter
          history={history}
          brands={brands}
          queryParams={queryParams}
        />
        <InsightContent>
          <InsightRow>
            <InsightTitle>
              {__('response frequency averages block')}
            </InsightTitle>
            <Summary data={combinedData} loading={loading} />
          </InsightRow>

          <InsightRow>
            <InsightTitle>{__('Trend')}</InsightTitle>
            <Chart
              loading={loading}
              height={300}
              data={conversationReport.trend}
            />
          </InsightRow>

          <InsightRow>
            <InsightTitle>{__('Team Member')}</InsightTitle>
            <TeamMembers
              loading={loading}
              datas={conversationReport.teamMembers || []}
            />
          </InsightRow>
        </InsightContent>
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

export default ConversationReport;

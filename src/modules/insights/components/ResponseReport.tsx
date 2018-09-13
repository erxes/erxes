import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Summary, TeamMembers } from '.';
import { InsightContent, InsightRow } from '../styles';
import CommonReport from './CommonReport';

class ResponseReport extends CommonReport {
  componentDidUpdate(prevProps) {
    if (prevProps.loading.punch && !this.props.loading.punch) {
      this.calculateWidth();
    }
  }

  componentDidMount() {
    this.calculateWidth();
  }

  renderBreadCrumnb() {
    return [
      { title: __('Insights'), link: '/insight' },
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
          <TeamMembers
            loading={loading.main}
            datas={teamMembers}
          />
        </InsightRow>
      </InsightContent>
    );
  }
}

export default ResponseReport;

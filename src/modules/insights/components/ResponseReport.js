import * as React from 'react';
import PropTypes from 'prop-types';
import CommonReport from './CommonReport';
import { Summary, TeamMembers } from './';
import { InsightContent, InsightRow } from '../styles';

const propTypes = {
  teamMembers: PropTypes.array.isRequired,
  punch: PropTypes.array.isRequired,
  summary: PropTypes.array.isRequired,
  loading: PropTypes.object.isRequired
};

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
    const { __ } = this.context;
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
            width={width}
          />
        </InsightRow>
      </InsightContent>
    );
  }
}

ResponseReport.propTypes = propTypes;

export default ResponseReport;

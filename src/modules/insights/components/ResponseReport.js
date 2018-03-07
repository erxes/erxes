import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'modules/common/components';
import CommonReport from './CommonReport';
import { Chart, Summary, TeamMembers, PunchCard } from './';
import { InsightContent, InsightRow, LoaderWrapper } from '../styles';

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

        <InsightRow
          innerRef={node => {
            this.wrapper = node;
          }}
        >
          {this.renderTitle('Response Trend')}
          <Chart
            loading={loading.main}
            width={width}
            height={300}
            data={trend}
          />
        </InsightRow>

        <InsightRow>
          {this.renderTitle('Punch card')}
          {!loading.punch ? (
            <PunchCard data={punch} width={width} />
          ) : (
            <LoaderWrapper>
              <Spinner objective />
            </LoaderWrapper>
          )}
        </InsightRow>

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

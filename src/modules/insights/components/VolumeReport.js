import React from 'react';
import PropTypes from 'prop-types';
import CommonReport from './CommonReport';
import { Summary, Insights } from './';
import { InsightRow, InsightContent } from '../styles';

const propTypes = {
  insights: PropTypes.array.isRequired,
  punch: PropTypes.array.isRequired,
  summary: PropTypes.array.isRequired,
  loading: PropTypes.object.isRequired
};

class VolumeReport extends CommonReport {
  componentDidUpdate(prevProps) {
    if (prevProps.loading.insights && !this.props.loading.insights) {
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
      { title: __('Volume Report') }
    ];
  }

  renderCharts() {
    const { trend, punch, insights, summary, loading } = this.props;

    const width = this.state.width;

    return (
      <InsightContent>
        <InsightRow>
          {this.renderTitle('Volume summary')}
          <Summary loading={loading.main} data={summary} />
        </InsightRow>

        {this.renderTrend('Volume Trend', loading, trend, width)}

        {this.renderPunchCard(loading, punch, width)}

        <InsightRow>
          {this.renderTitle('Insights')}
          <Insights
            loading={loading.insights}
            data={insights}
            wrapperWidth={width}
          />
        </InsightRow>
      </InsightContent>
    );
  }
}

VolumeReport.propTypes = propTypes;

export default VolumeReport;

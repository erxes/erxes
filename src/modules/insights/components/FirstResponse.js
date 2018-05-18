import React from 'react';
import PropTypes from 'prop-types';
import CommonReport from './CommonReport';
import { Chart, TeamMembers } from './';
import { convertTime } from '../utils';
import { InsightRow, InsightContent } from '../styles';

const propTypes = {
  teamMembers: PropTypes.array.isRequired,
  time: PropTypes.number,
  isLoading: PropTypes.bool
};

class FirstResponse extends CommonReport {
  renderBreadCrumnb() {
    const { __ } = this.context;
    return [
      { title: __('Insights'), link: '/insight' },
      { title: __('First Response Report') }
    ];
  }

  renderCharts() {
    const { trend, teamMembers, time, isLoading } = this.props;

    return (
      <InsightContent>
        <InsightRow
          innerRef={node => {
            this.wrapper = node;
          }}
        >
          {this.renderTitle(
            'Daily First Response Resolve Rate',
            convertTime(time)
          )}
          <Chart loading={isLoading} height={300} data={trend} />
        </InsightRow>

        <InsightRow>
          {this.renderTitle(
            'Daily First Response Resolve Rate by Team Members',
            convertTime(time)
          )}
          <TeamMembers loading={isLoading} datas={teamMembers} />
        </InsightRow>
      </InsightContent>
    );
  }
}

FirstResponse.propTypes = propTypes;

export default FirstResponse;

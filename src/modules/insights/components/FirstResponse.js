import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';
import Sidebar from './Sidebar';
import Filter from './Filter';
import Chart from './Chart';
import TeamMembers from './TeamMembers';
import { convertTime } from '../utils';
import {
  InsightWrapper,
  InsightRow,
  InsightContent,
  InsightTitle,
  FullLoader
} from '../styles';

const propTypes = {
  history: PropTypes.object,
  trend: PropTypes.array.isRequired,
  teamMembers: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  time: PropTypes.number,
  queryParams: PropTypes.object,
  isLoading: PropTypes.bool
};

class FirstResponse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 600
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isLoading && !this.props.isLoading) {
      const width = this.wrapper.clientWidth;
      this.setState({ width });
    }
  }

  renderTitle(title, time) {
    return (
      <InsightTitle>
        {title}
        <span>({time})</span>
      </InsightTitle>
    );
  }

  mainContent() {
    const {
      trend,
      teamMembers,
      brands,
      time,
      history,
      isLoading,
      queryParams
    } = this.props;
    const width = this.state.width;

    if (isLoading) {
      return (
        <FullLoader>
          <Spinner />
        </FullLoader>
      );
    }

    return (
      <InsightWrapper>
        <Filter history={history} brands={brands} queryParams={queryParams} />
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
            <Chart width={width} height={300} data={trend} />
          </InsightRow>

          <InsightRow>
            {this.renderTitle(
              'Daily First Response Resolve Rate by Team Members',
              convertTime(time)
            )}
            <TeamMembers datas={teamMembers} width={width} />
          </InsightRow>
        </InsightContent>
      </InsightWrapper>
    );
  }

  render() {
    const breadcrumb = [
      { title: 'Insights', link: '/insight' },
      { title: 'First Response Report' }
    ];

    return (
      <Wrapper
        relative
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.mainContent()}
      />
    );
  }
}

FirstResponse.propTypes = propTypes;

export default FirstResponse;

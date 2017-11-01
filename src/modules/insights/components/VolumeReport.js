import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';
import Sidebar from './Sidebar';
import Filter from './Filter';
import Chart from './Chart';
import Summary from './Summary';
import PunchCard from './PunchCard';
import Insights from './Insights';
import {
  InsightWrapper,
  InsightRow,
  InsightContent,
  InsightTitle,
  FullLoader
} from '../styles';

const propTypes = {
  insights: PropTypes.array.isRequired,
  trend: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  punch: PropTypes.array.isRequired,
  summary: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  isLoading: PropTypes.bool.isRequired
};

class VolumeReport extends React.Component {
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

  renderTitle(title) {
    return <InsightTitle>{title}</InsightTitle>;
  }

  mainContent() {
    const {
      trend,
      punch,
      insights,
      summary,
      brands,
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
        <Filter brands={brands} queryParams={queryParams} />
        <InsightContent>
          <InsightRow>
            {this.renderTitle('Volume summary')}
            <Summary data={summary} />
          </InsightRow>

          <InsightRow
            innerRef={node => {
              this.wrapper = node;
            }}
          >
            {this.renderTitle('Volume Trend')}
            <Chart width={width} height={320} data={trend} />
          </InsightRow>

          {width !== 600 ? (
            <InsightRow>
              {this.renderTitle('Punch card')}
              <PunchCard data={punch} width={width} />
            </InsightRow>
          ) : null}

          <InsightRow>
            {this.renderTitle('Insights')}
            <Insights data={insights} wrapperWidth={width} />
          </InsightRow>
        </InsightContent>
      </InsightWrapper>
    );
  }

  render() {
    const breadcrumb = [
      { title: 'Insights', link: '/insight' },
      { title: 'Volume Report' }
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

VolumeReport.propTypes = propTypes;

export default VolumeReport;

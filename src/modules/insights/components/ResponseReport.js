import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';
import Sidebar from './Sidebar';
import Filter from './Filter';
import Chart from './Chart';
import Summary from './Summary';
import TeamMembers from './TeamMembers';
import PunchCard from './PunchCard';

const propTypes = {
  trend: PropTypes.array.isRequired,
  teamMembers: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  punch: PropTypes.array.isRequired,
  summary: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  isLoading: PropTypes.bool.isRequired
};

class ResponseReport extends React.Component {
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
    return <h5 className="insight-title">{title}</h5>;
  }

  mainContent() {
    const {
      trend,
      teamMembers,
      punch,
      summary,
      brands,
      isLoading,
      queryParams
    } = this.props;
    const width = this.state.width;

    if (isLoading) {
      return (
        <div className="full-loader">
          <Spinner />
        </div>
      );
    }

    return (
      <div className="insight-wrapper">
        <Filter brands={brands} queryParams={queryParams} />
        <div className="insight-content">
          <div className="insight-row">
            {this.renderTitle('Response Times summary')}
            <Summary data={summary} />
          </div>

          <div
            className="insight-row"
            ref={node => {
              this.wrapper = node;
            }}
          >
            {this.renderTitle('Response Trend')}
            <Chart width={width} height={300} data={trend} />
          </div>

          {width !== 600 ? (
            <div className="insight-row">
              {this.renderTitle('Punch card')}
              <PunchCard data={punch} width={width} />
            </div>
          ) : null}

          <div className="insight-row">
            {this.renderTitle('Response by team members')}
            <TeamMembers datas={teamMembers} width={width} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const breadcrumb = [
      { title: 'Insights', link: '/insight' },
      { title: 'Response Report' }
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

ResponseReport.propTypes = propTypes;

export default ResponseReport;

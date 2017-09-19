import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar';
import Filter from './Filter';
import Chart from './Chart';
import Summary from './Summary';
import PunchCard from './PunchCard';
import Insights from './Insights';

const propTypes = {
  insights: PropTypes.array.isRequired,
  trend: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  punch: PropTypes.array.isRequired,
  summary: PropTypes.array.isRequired,
};

class VolumeReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 600,
    };
  }

  componentDidMount() {
    const width = this.wrapper.clientWidth;
    this.setState({ width });
  }

  renderTitle(title) {
    return (
      <h5 className="insight-title">
        {title}
      </h5>
    );
  }

  render() {
    const { trend, punch, insights, summary, brands } = this.props;
    const width = this.state.width;

    const content = (
      <div className="insight-wrapper">
        <Filter brands={brands} />
        <div className="insight-content">
          <div className="insight-row">
            {this.renderTitle('Volume summary')}
            <Summary data={summary} />
          </div>

          <div
            className="insight-row"
            ref={node => {
              this.wrapper = node;
            }}
          >
            {this.renderTitle('Volume Trend')}
            <Chart width={width} height={320} data={trend} />
          </div>

          {width !== 600
            ? <div className="insight-row">
                {this.renderTitle('Punch card')}
                <PunchCard data={punch} width={width} />
              </div>
            : null}

          <div className="insight-row">
            {this.renderTitle('Insights')}
            <Insights data={insights} wrapperWidth={width} />
          </div>
        </div>
      </div>
    );

    const breadcrumb = [{ title: 'Insights', link: '/insight' }, { title: 'Volume Report' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

VolumeReport.propTypes = propTypes;

export default VolumeReport;

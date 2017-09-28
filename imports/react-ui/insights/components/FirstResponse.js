import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar';
import Filter from './Filter';
import Chart from './Chart';
import TeamMembers from './TeamMembers';
import { convertTime } from '../utils';

const propTypes = {
  trend: PropTypes.array.isRequired,
  teamMembers: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  time: PropTypes.number,
  queryParams: PropTypes.object,
};

class FirstResponse extends React.Component {
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
    const { trend, teamMembers, brands, time, queryParams } = this.props;
    const width = this.state.width;

    const content = (
      <div className="insight-wrapper">
        <Filter brands={brands} queryParams={queryParams} />
        <div className="insight-content">
          <div
            className="insight-row"
            ref={node => {
              this.wrapper = node;
            }}
          >
            {this.renderTitle('Daily First Response Resolve Rate')}
            <span className="response-time">
              ({convertTime(time)})
            </span>
            <Chart width={width} height={300} data={trend} />
          </div>

          <div className="insight-row">
            {this.renderTitle('Daily First Response Resolve Rate by Team Members')}
            <TeamMembers datas={teamMembers} width={width} />
          </div>
        </div>
      </div>
    );

    const breadcrumb = [
      { title: 'Insights', link: '/insight' },
      { title: 'First Response Report' },
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

FirstResponse.propTypes = propTypes;

export default FirstResponse;

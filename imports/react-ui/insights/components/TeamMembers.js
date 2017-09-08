import React from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';

const propTypes = {
  datas: PropTypes.array.isRequired,
  width: PropTypes.number,
};

class TeamMembers extends React.Component {
  renderChart(userData, index) {
    const { width } = this.props;

    return (
      <div className="col-sm-6 insight-user-data" key={index}>
        <div className="user-profile">
          <a href="#">
            <img src={userData.avatar} alt={userData.fullName} />
          </a>
          <span className="full-name">
            {userData.fullName}
          </span>
          <div className="clearfix" />
        </div>
        <div>
          <Chart width={width * 0.45} height={200} data={userData.data} />
        </div>
      </div>
    );
  }

  render() {
    const { datas } = this.props;

    return (
      <div>
        {datas.map((data, index) => this.renderChart(data, index))};
      </div>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;

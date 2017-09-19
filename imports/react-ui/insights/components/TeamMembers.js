import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import Chart from './Chart';

const propTypes = {
  datas: PropTypes.array.isRequired,
  width: PropTypes.number,
};

class TeamMembers extends React.Component {
  renderChart(userData, index) {
    const { width } = this.props;

    return (
      <Col sm={6} key={index}>
        <div className="insight-user-data">
          <div className="user-profile">
            <a href="#">
              <img src={userData.avatar || '/images/userDefaultIcon.png'} alt={userData.fullName} />
            </a>
            <span className="full-name">
              {userData.fullName}
            </span>
          </div>
          <Chart width={width * 0.45} height={200} data={userData.data} />
        </div>
      </Col>
    );
  }

  render() {
    const { datas } = this.props;

    return (
      <Row>
        {datas.map((data, index) => this.renderChart(data, index))}
      </Row>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;

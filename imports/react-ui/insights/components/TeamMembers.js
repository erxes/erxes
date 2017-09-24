import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import Chart from './Chart';
import { convertTime } from '../utils';

const propTypes = {
  datas: PropTypes.array.isRequired,
  width: PropTypes.number,
};

class TeamMembers extends React.Component {
  renderChart(userData, index) {
    const { width } = this.props;
    const data = userData.data ? userData.data : userData;

    return (
      <Col sm={6} key={index}>
        <div className="insight-user-data">
          <div className="user-profile">
            <a href="#">
              <img src={data.avatar || '/images/userDefaultIcon.png'} alt={data.fullName} />
            </a>
            <span className="full-name">
              {data.fullName}
            </span>

            {userData.time
              ? <span>
                  &nbsp; ({convertTime(userData.time)})
                </span>
              : null}
          </div>
          <Chart width={width * 0.45} height={200} data={data.graph} />
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

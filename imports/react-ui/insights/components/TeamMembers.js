import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Sidebar from './Sidebar';
import Filter from './Filter';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  mainData: PropTypes.array.isRequired,
  usersData: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
};

class TeamMembers extends React.Component {
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

  renderChart(userData, index) {
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
          <LineChart width={this.state.width * 0.45} height={200} data={userData.data}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#5884d8" activeDot={{ r: 4 }} />
          </LineChart>
        </div>
      </div>
    );
  }

  render() {
    const { mainData, usersData, brands } = this.props;

    const content = (
      <div
        className="insight-wrapper"
        ref={node => {
          this.wrapper = node;
        }}
      >
        <Filter brands={brands} />

        <div className="margined" id="insightWrapper">
          <LineChart width={this.state.width} height={300} data={mainData}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#452679" activeDot={{ r: 8 }} />
          </LineChart>
          {usersData.map((data, index) => this.renderChart(data, index))};
        </div>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Team members' }]} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;

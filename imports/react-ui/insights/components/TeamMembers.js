import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ControlLabel } from 'react-bootstrap';
import { integrationOptions, selectOptions } from '../utils';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const propTypes = {
  mainData: PropTypes.array.isRequired,
  usersData: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
};

class TeamMembers extends React.Component {
  constructor(props) {
    super(props);

    // states
    this.state = {
      width: 600,
      brandId: '',
      integrationType: '',
    };
  }

  componentDidMount() {
    const width = $('#insightWrapper').width();
    this.setState({ width });
  }

  onTypeChange(value) {
    const integrationType = value ? value.value : '';
    this.setState({ integrationType });
    Wrapper.Sidebar.filter('integrationType', integrationType);
  }

  onBrandChange(value) {
    const brandId = value ? value.value : '';
    this.setState({ brandId });
    Wrapper.Sidebar.filter('brandId', brandId);
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
    const integrations = INTEGRATIONS_TYPES.ALL_LIST;

    const content = (
      <div className="insight-wrapper">
        <div className="insight-filter">
          <div className="row">
            <div className="pull-right col-sm-2">
              <ControlLabel>Integrations</ControlLabel>
              <Select
                placeholder="Choose integrations"
                value={this.state.integrationType}
                onChange={value => this.onTypeChange(value)}
                optionRenderer={option =>
                  <div className="simple-option">
                    <span>
                      {option.label}
                    </span>
                  </div>}
                options={integrationOptions(integrations)}
              />
            </div>

            <div className="pull-right col-sm-2">
              <ControlLabel>Brands</ControlLabel>

              <Select
                placeholder="Choose brands"
                value={this.state.brandId}
                onChange={value => this.onBrandChange(value)}
                optionRenderer={option =>
                  <div className="simple-option">
                    <span>
                      {option.label}
                    </span>
                  </div>}
                options={selectOptions(brands)}
              />
            </div>
          </div>
        </div>
        <div className="margined" id="insightWrapper">
          <LineChart width={this.state.width} height={300} data={mainData}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
          {usersData.map((data, index) => this.renderChart(data, index))};
        </div>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Team members' }]} />}
          content={content}
        />
      </div>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;

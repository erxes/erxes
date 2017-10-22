import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '../../layout/components';

const propTypes = {
  user: PropTypes.object.isRequired,
  companies: PropTypes.func
};

class RightSidebar extends Component {
  render() {
    const Sidebar = Wrapper.Sidebar;
    const { Title } = Sidebar.Section;

    return (
      <Sidebar>
        <Sidebar.Section>asd</Sidebar.Section>

        <Sidebar.Section>
          <Title>Companies</Title>
        </Sidebar.Section>

        <Sidebar.Section>
          <Title>History</Title>
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;

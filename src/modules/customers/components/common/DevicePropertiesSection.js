import React from 'react';
import PropTypes from 'prop-types';
import parse from 'ua-parser-js';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

class DevicePropertiesSection extends React.Component {
  renderDeviceProperty(text, value, secondValue, nowrap) {
    const { __ } = this.context;

    if (value || secondValue) {
      return (
        <li>
          {__(text)}:
          <SidebarCounter nowrap={nowrap}>
            {value} {secondValue}
          </SidebarCounter>
        </li>
      );
    }

    return null;
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { customer } = this.props;
    const { __ } = this.context;
    const location = customer.location;

    if (!location) {
      return null;
    }

    const ua = parse(location.userAgent || ' ');

    return (
      <Section>
        <Title>{__('Device properties')}</Title>

        <SidebarList className="no-link">
          {this.renderDeviceProperty('Location', location.country)}
          {this.renderDeviceProperty(
            'Browser',
            ua.browser.name,
            ua.browser.version
          )}
          {this.renderDeviceProperty('Platform', ua.os.name, ua.os.version)}
          {this.renderDeviceProperty('IP Address', location.remoteAddress)}
          {this.renderDeviceProperty('Hostname', location.hostname)}
          {this.renderDeviceProperty('Language', location.language)}
          {this.renderDeviceProperty(
            'User Agent',
            location.userAgent,
            null,
            true
          )}
        </SidebarList>
      </Section>
    );
  }
}

DevicePropertiesSection.propTypes = propTypes;
DevicePropertiesSection.contextTypes = {
  __: PropTypes.func
};

export default DevicePropertiesSection;

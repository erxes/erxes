import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import parse from 'ua-parser-js';

type Props = {
  customer: ICustomer;
};

class DevicePropertiesSection extends React.Component<Props> {
  renderDeviceProperty(
    text: string,
    value?: string,
    secondValue?: string,
    nowrap?: boolean
  ) {
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
            '',
            true
          )}
        </SidebarList>
      </Section>
    );
  }
}

export default DevicePropertiesSection;

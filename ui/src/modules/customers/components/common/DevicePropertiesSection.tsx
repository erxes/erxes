import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import parse from 'ua-parser-js';

type Props = {
  customer: ICustomer;
  collapseCallback?: () => void;
};

export const renderFlag = (countryCode?: string) => {
  if (!countryCode) {
    return null;
  }

  return (
    <img
      alt="Flag"
      style={{ marginBottom: '2px', width: '17px' }}
      src={`https://www.countryflags.io/${countryCode}/shiny/24.png`}
    />
  );
};

class DevicePropertiesSection extends React.Component<Props> {
  renderDeviceProperty = (
    text: string,
    value?: any,
    secondValue?: string,
    nowrap?: boolean
  ) => {
    if (value || secondValue) {
      return (
        <li>
          <FieldStyle overflow="unset">{__(text)}:</FieldStyle>
          <SidebarCounter nowrap={nowrap}>
            {value} {secondValue}
          </SidebarCounter>
        </li>
      );
    }

    return null;
  };

  renderContent() {
    const { customer } = this.props;
    const location = customer.location;

    if (!location) {
      return <EmptyState icon="placeholder" text="No location" size="small" />;
    }

    const ua = parse(location.userAgent || ' ');

    return (
      <SidebarList className="no-link">
        {this.renderDeviceProperty(
          'Location',
          renderFlag(location.countryCode),
          location.country
        )}
        {this.renderDeviceProperty(
          'Browser',
          ua.browser.name,
          ua.browser.version
        )}
        {this.renderDeviceProperty('Platform', ua.os.name, ua.os.version)}
        {this.renderDeviceProperty('IP Address', location.remoteAddress)}
        {this.renderDeviceProperty('Hostname', location.hostname)}
        {this.renderDeviceProperty('Language', location.language)}
        {this.renderDeviceProperty('User Agent', location.userAgent, '', true)}
      </SidebarList>
    );
  }

  render() {
    const { collapseCallback } = this.props;

    return (
      <Box
        title={__('Device properties')}
        name="showDeviceProperties"
        callback={collapseCallback}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

export default DevicePropertiesSection;

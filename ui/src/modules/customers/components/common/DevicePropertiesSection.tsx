import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import parse from 'ua-parser-js';

type Props = {
  customer: ICustomer;
  collapseCallback?: () => void;
  fields: IField[];
  isDetail: boolean;
};

export const renderFlag = (countryCode?: string) => {
  if (!countryCode) {
    return null;
  }

  return (
    <img
      alt="Flag"
      style={{ marginBottom: '2px', width: '17px' }}
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
    />
  );
};

class DevicePropertiesSection extends React.Component<Props> {
  renderDeviceProperty = (
    text: string,
    field: string,
    value?: any,
    secondValue?: string,
    nowrap?: boolean
  ) => {
    const { fields, isDetail } = this.props;
    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';

    const property = fields.find(e => e.type === field);

    if (property && !property[isVisibleKey]) {
      return null;
    }

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
          'location',
          renderFlag(location.countryCode),
          location.country
        )}
        {this.renderDeviceProperty(
          'Browser',
          'browser',
          ua.browser.name,
          ua.browser.version
        )}
        {this.renderDeviceProperty(
          'Platform',
          'platform',
          ua.os.name,
          ua.os.version
        )}
        {this.renderDeviceProperty(
          'IP Address',
          'ipAddress',
          location.remoteAddress
        )}
        {this.renderDeviceProperty('Hostname', 'hostName', location.hostname)}
        {this.renderDeviceProperty('Language', 'language', location.language)}
        {this.renderDeviceProperty(
          'User Agent',
          'agent',
          location.userAgent,
          '',
          true
        )}
      </SidebarList>
    );
  }

  render() {
    const { collapseCallback, fields } = this.props;

    if (!fields || fields.length === 0) {
      return null;
    }

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

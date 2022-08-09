import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';

import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IField } from '@erxes/ui/src/types';
import { IFieldsVisibility } from '../../types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import parse from 'ua-parser-js';

type Props = {
  customer: ICustomer;
  collapseCallback?: () => void;
  fields: IField[];
  deviceFieldsVisibility: (key: string) => IFieldsVisibility;
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
    const { deviceFieldsVisibility, isDetail } = this.props;

    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';

    const visibility = deviceFieldsVisibility(isVisibleKey);

    if (!visibility[field]) {
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

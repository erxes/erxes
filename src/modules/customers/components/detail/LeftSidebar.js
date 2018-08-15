import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  BasicInfoSection,
  CustomFieldsSection
} from 'modules/customers/containers/common';

import {
  TaggerSection,
  MessengerSection,
  DevicePropertiesSection
} from '../common';

export default class LeftSidebar extends React.Component {
  render() {
    const { customer, wide, taggerRefetchQueries } = this.props;

    return (
      <Sidebar wide={wide}>
        <BasicInfoSection customer={customer} />
        <CustomFieldsSection customer={customer} />
        <DevicePropertiesSection customer={customer} />
        <MessengerSection customer={customer} />
        <TaggerSection
          data={customer}
          type="customer"
          refetchQueries={taggerRefetchQueries}
        />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = {
  customer: PropTypes.object.isRequired,
  taggerRefetchQueries: PropTypes.array,
  wide: PropTypes.bool
};

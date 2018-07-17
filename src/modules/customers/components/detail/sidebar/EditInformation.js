import React from 'react';
import PropTypes from 'prop-types';
import parse from 'ua-parser-js';
import { Sidebar } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import { ManageGroups } from 'modules/settings/properties/components';
import { BasicInfo } from 'modules/customers/containers';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

import {
  TaggerSection,
  MessengerSection,
  TwitterSection,
  FacebookSection,
  BaseSection
} from './';

const propTypes = {
  customer: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  sectionTop: PropTypes.node,
  sectionBottom: PropTypes.node,
  otherProperties: PropTypes.node,
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object,
  wide: PropTypes.bool
};

class LeftSidebar extends ManageGroups {
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

  renderDeviceProperties() {
    const { customer } = this.props;
    const { __ } = this.context;
    const location = customer.location;

    if (location) {
      const ua = parse(location.userAgent || ' ');
      const content = (
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
      );

      return (
        <BaseSection
          title={__('Device properties')}
          content={content}
          isUseCustomer={true}
          name="showDeviceProperty"
        />
      );
    }

    return null;
  }

  renderOtherProperties() {
    const { otherProperties } = this.props;
    const { __ } = this.context;

    if (otherProperties) {
      const content = (
        <SidebarList className="no-link">{otherProperties}</SidebarList>
      );

      return (
        <BaseSection
          title={__('Other properties')}
          content={content}
          isUseCustomer={true}
          name="showOtherProperty"
        />
      );
    }

    return null;
  }

  renderSidebarFooter() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.cancelEditing}
          icon="cancel-1"
        >
          Discard
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.save}
          icon="checked-1"
        >
          Save
        </Button>
      </Sidebar.Footer>
    );
  }

  render() {
    const { customer, wide } = this.props;
    const { kind } = customer.integration || {};

    return (
      <Sidebar wide={wide} footer={this.renderSidebarFooter()}>
        <BasicInfo customer={customer} save={this.props.save} />
        {this.props.sectionTop && this.props.sectionTop}
        {this.renderGroups()}
        {this.props.sectionBottom && this.props.sectionBottom}
        {this.renderDeviceProperties()}
        {this.renderOtherProperties()}
        {kind === 'messenger' && <MessengerSection customer={customer} />}
        {kind === 'twitter' && <TwitterSection customer={customer} />}
        {kind === 'facebook' && <FacebookSection customer={customer} />}
        <TaggerSection data={customer} type="customer" />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;
LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;

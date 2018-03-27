import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { Row, RowTitle, Box, BoxName, Divider } from '../styles';

class Settings extends Component {
  renderBox(name, image, to) {
    const { __ } = this.context;
    return (
      <Box>
        <Link to={to}>
          <img src={image} alt={name} />
          <BoxName>{__(name)}</BoxName>
        </Link>
      </Box>
    );
  }

  render() {
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Settings'), link: '/settings' }];

    const content = (
      <div>
        <Row>
          <RowTitle className="secondRow">{__('General Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Account default',
              '/images/icons/erxes-16.svg',
              '/settings/general'
            )}
            {this.renderBox(
              'Team Members',
              '/images/icons/erxes-02.svg',
              '/settings/team'
            )}
            {this.renderBox(
              'Properties',
              '/images/icons/erxes-01.svg',
              '/settings/properties'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Integration Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Channels',
              '/images/icons/erxes-05.svg',
              '/settings/channels'
            )}
            {this.renderBox(
              'Brands',
              '/images/icons/erxes-03.svg',
              '/settings/brands'
            )}
            {this.renderBox(
              'Integrations',
              '/images/icons/erxes-04.svg',
              '/settings/integrations'
            )}
            {this.renderBox(
              'Response Template',
              '/images/icons/erxes-10.svg',
              '/settings/response-templates'
            )}
            {this.renderBox(
              'Email Template',
              '/images/icons/erxes-09.svg',
              '/settings/email-templates'
            )}
            {this.renderBox(
              'Email Appearance',
              '/images/icons/erxes-08.svg',
              '/settings/emails'
            )}
            {this.renderBox(
              'Forms',
              '/images/icons/erxes-12.svg',
              '/settings/forms'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle className="secondRow">{__('Deal Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Boards & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/deals'
            )}
            {this.renderBox(
              'Product & Service',
              '/images/icons/erxes-13.svg',
              '/settings/product-service'
            )}
          </div>
        </Row>
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

Settings.contextTypes = {
  __: PropTypes.func
};

export default Settings;

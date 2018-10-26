import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Box, BoxName, Divider, Row, RowTitle } from '../styles';
import { ProjectVersions } from '../types';

class Settings extends React.Component<{ versions: ProjectVersions }> {
  renderBox(name: string, image: string, to: string) {
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
    const breadcrumb = [{ title: __('Settings'), link: '/settings' }];
    const { versions } = this.props;
    const {
      erxesVersion,
      apiVersion,
      widgetVersion,
      widgetApiVersion
    } = versions;

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
            {this.renderBox(
              'Import histories',
              '/images/icons/erxes-12.svg',
              '/settings/importHistories'
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
              'App store',
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
        <Row>
          <div>
            <div>
              Erxes version: {erxesVersion && erxesVersion.packageVersion}
            </div>
            <div>
              Erxes-api version:{' '}
              {apiVersion && versions.apiVersion.packageVersion}
            </div>
            <div>
              Erxes-widgets version:{' '}
              {widgetVersion && versions.widgetVersion.packageVersion}
            </div>
            <div>
              Erxes-widgets-api version:{' '}
              {widgetApiVersion && widgetApiVersion.packageVersion}
            </div>
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

export default Settings;

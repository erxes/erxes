import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  BoxName,
  Divider,
  MenusContainer,
  Row,
  RowTitle
} from '../styles';

class Settings extends React.PureComponent {
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

    const content = (
      <MenusContainer>
        <Row>
          <RowTitle>{__('General Settings')}</RowTitle>
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
              'Permission',
              '/images/icons/erxes-20.svg',
              '/settings/permissions'
            )}
            {this.renderBox(
              'Properties',
              '/images/icons/erxes-01.svg',
              '/settings/properties'
            )}
            {this.renderBox(
              'Tags',
              '/images/icons/erxes-18.svg',
              '/tags/conversation'
            )}
            {this.renderBox(
              'Segments',
              '/images/icons/erxes-15.svg',
              '/segments/customer'
            )}
            {this.renderBox(
              'Import histories',
              '/images/icons/erxes-07.svg',
              '/settings/importHistories'
            )}
            {this.renderBox(
              'Status',
              '/images/icons/erxes-06.svg',
              '/settings/status'
            )}
            {this.renderBox(
              'Logs',
              '/images/icons/erxes-14.svg',
              '/settings/logs'
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
            {this.renderBox(
              'Script manager',
              '/images/icons/erxes-12.svg',
              '/settings/scripts'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Deal Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Boards & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/deal'
            )}
            {this.renderBox(
              'Product & Service',
              '/images/icons/erxes-13.svg',
              '/settings/product-service'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Ticket Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Boards & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/ticket'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Task Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Boards & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/task'
            )}
          </div>
        </Row>
      </MenusContainer>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Settings')} breadcrumb={breadcrumb} />
        }
        content={content}
        transparent={true}
      />
    );
  }
}

export default Settings;

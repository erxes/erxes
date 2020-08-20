import WithPermission from 'modules/common/components/WithPermission';
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
  renderBox(
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[]
  ) {
    const box = (
      <Box>
        <Link to={to}>
          <img src={image} alt={name} />
          <BoxName>{__(name)}</BoxName>
        </Link>
      </Box>
    );

    if (!action) {
      return box;
    }

    return (
      <WithPermission action={action} actions={permissions}>
        {box}
      </WithPermission>
    );
  }

  render() {
    const breadcrumb = [{ title: __('Settings'), link: '/settings' }];

    const integrationSettingsActions = [
      'showIntegrations',
      'integrationsCreateMessengerIntegration',
      'integrationsEditMessengerIntegration',
      'integrationsSaveMessengerAppearanceData',
      'integrationsSaveMessengerConfigs',
      'integrationsCreateLeadIntegration',
      'integrationsEditLeadIntegration',
      'integrationsRemove',
      'integrationsArchive',
      'integrationsEdit'
    ];
    const taskPermissions = [
      'taskBoardsAdd',
      'taskBoardsEdit',
      'taskBoardsRemove',
      'taskPipelinesAdd',
      'taskPipelinesEdit',
      'taskPipelinesUpdateOrder',
      'taskPipelinesRemove',
      'taskStagesAdd',
      'taskStagesEdit',
      'taskStagesUpdateOrder',
      'taskStagesRemove',
      'tasksAll'
    ];
    const ticketPermissions = [
      'ticketBoardsAdd',
      'ticketBoardsEdit',
      'ticketBoardsRemove',
      'ticketPipelinesAdd',
      'ticketPipelinesEdit',
      'ticketPipelinesUpdateOrder',
      'ticketPipelinesRemove',
      'ticketStagesAdd',
      'ticketStagesEdit',
      'ticketStagesUpdateOrder',
      'ticketStagesRemove'
    ];
    const dealPermissions = [
      'dealBoardsAdd',
      'dealBoardsEdit',
      'dealBoardsRemove',
      'dealPipelinesAdd',
      'dealPipelinesEdit',
      'dealPipelinesUpdateOrder',
      'dealPipelinesRemove',
      'dealStagesAdd',
      'dealStagesEdit',
      'dealStagesUpdateOrder',
      'dealStagesRemove'
    ];
    const productPermissions = ['showProducts', 'manageProducts'];
    const growthHackPermissions = [
      'growthHackBoardsAdd',
      'growthHackBoardsEdit',
      'growthHackBoardsRemove',
      'growthHackPipelinesAdd',
      'growthHackPipelinesEdit',
      'growthHackPipelinesUpdateOrder',
      'growthHackPipelinesRemove',
      'growthHackStagesAdd',
      'growthHackStagesEdit',
      'growthHackStagesUpdateOrder',
      'growthHackStagesRemove'
    ];
    const growthHackTemplatePermissions = [
      'growthHackTemplatesAdd',
      'growthHackTemplatesEdit',
      'growthHackTemplatesRemove',
      'growthHackTemplatesDuplicate',
      'showGrowthHackTemplates'
    ];
    const teamPermissions = [
      'showUsers',
      'usersEdit',
      'usersInvite',
      'usersSetActiveStatus',
      'exportUsers'
    ];
    const permissionActions = [
      'managePermissions',
      'showPermissions',
      'showPermissionModules',
      'showPermissionActions',
      'exportPermissions'
    ];

    const content = (
      <MenusContainer>
        <Row>
          <RowTitle>{__('General Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'System config',
              '/images/icons/erxes-16.svg',
              '/settings/general',
              'generalSettingsAll',
              ['manageGeneralSettings', 'showGeneralSettings']
            )}
            {this.renderBox(
              'Team Members',
              '/images/icons/erxes-02.svg',
              '/settings/team',
              'usersAll',
              teamPermissions
            )}
            {this.renderBox(
              'Permission',
              '/images/icons/erxes-23.svg',
              '/settings/permissions',
              'permissionsAll',
              permissionActions
            )}
            {this.renderBox(
              'Properties',
              '/images/icons/erxes-01.svg',
              '/settings/properties',
              ''
            )}
            {this.renderBox(
              'Tags',
              '/images/icons/erxes-18.svg',
              '/tags/conversation',
              'tagsAll',
              ['showTags', 'manageTags']
            )}
            {this.renderBox(
              'Segments',
              '/images/icons/erxes-15.svg',
              '/segments/customer',
              'segmentsAll',
              ['showSegments', 'manageSegments']
            )}
            {this.renderBox(
              'Import & Export',
              '/images/icons/erxes-07.svg',
              '/settings/importHistories',
              'importHistoriesAll',
              ['importHistories', 'removeImportHistories', 'importXlsFile']
            )}
            {this.renderBox(
              'Status',
              '/images/icons/erxes-06.svg',
              '/settings/status',
              ''
            )}
            {this.renderBox(
              'Logs',
              '/images/icons/erxes-14.svg',
              '/settings/logs',
              'viewLogs'
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
              '/settings/channels',
              'channelsAll',
              ['showChannels', 'manageChannels']
            )}
            {this.renderBox(
              'Brands',
              '/images/icons/erxes-03.svg',
              '/settings/brands',
              'brandsAll',
              ['showBrands', 'manageBrands']
            )}
            {this.renderBox(
              'App store',
              '/images/icons/erxes-04.svg',
              '/settings/integrations',
              'integrationsAll',
              integrationSettingsActions
            )}
            {this.renderBox(
              'Response Template',
              '/images/icons/erxes-10.svg',
              '/settings/response-templates',
              'responseTemplatesAll',
              ['manageResponseTemplate', 'showResponseTemplates']
            )}
            {this.renderBox(
              'Email Template',
              '/images/icons/erxes-09.svg',
              '/settings/email-templates',
              'emailTemplateAll',
              ['showEmailTemplates', 'manageEmailTemplate']
            )}
            {this.renderBox(
              'Email Appearance',
              '/images/icons/erxes-08.svg',
              '/settings/emails',
              'emailAppearanceAll',
              ['manageEmailAppearance', 'showEmailappearance']
            )}
            {this.renderBox(
              'Script manager',
              '/images/icons/erxes-12.svg',
              '/settings/scripts',
              'scriptsAll',
              ['showScripts', 'manageScripts']
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Growth Hacking Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Marketing campaigns & Projects',
              '/images/icons/erxes-20.svg',
              '/settings/boards/growthHack',
              'growthHacksAll',
              growthHackPermissions
            )}
            {this.renderBox(
              'Growth Hacking Templates',
              '/images/icons/erxes-22.svg',
              '/settings/boards/growthHackTemplate',
              'growthHacksAll',
              growthHackTemplatePermissions
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Sales Pipeline Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Sales board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/deal',
              'dealsAll',
              dealPermissions
            )}
            {this.renderBox(
              'Product & Service',
              '/images/icons/erxes-13.svg',
              '/settings/product-service',
              'productsAll',
              productPermissions
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Ticket Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Ticket board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/ticket',
              'ticketsAll',
              ticketPermissions
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>{__('Task Settings')}</RowTitle>
          <div>
            {this.renderBox(
              'Task board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/task',
              'tasksAll',
              taskPermissions
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

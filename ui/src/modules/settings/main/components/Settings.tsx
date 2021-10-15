import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { pluginsOfSettings } from 'pluginUtils';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  BoxName,
  MenusContainer,
  Row,
  RowTitle,
  Divider
} from '../styles';

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
  'taskPipelinesArchive',
  'taskPipelinesCopied',
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
  'ticketPipelinesArchive',
  'ticketPipelinesCopied',
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
  'dealPipelinesArchive',
  'dealPipelinesArchive',
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
  'growthHackPipelinesArchive',
  'growthHackPipelinesCopied',
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
const calendarActions = [
  'calendarsAdd',
  'calendarsEdit',
  'calendarsRemove',
  'showCalendars',
  'showCalendarGroups',
  'calendarGroupsAdd',
  'calendarGroupsEdit',
  'calendarGroupsRemove'
];

class Settings extends React.PureComponent {
  renderBox(
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[],
    type?: string
  ) {
    const box = (
      <Box className={type && 'hasBorder'}>
        <Link to={to}>
          {type && <em>{type}</em>}
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
    const content = (
      <MenusContainer id={'SettingsMain'}>
        <Row>
          <RowTitle>
            {__('General Settings')}
            <span>{__('Set up your basic settings')}</span>
          </RowTitle>
          <div id={'SettingsGeneralSettings'}>
            {this.renderBox(
              'System Configuration',
              '/images/icons/erxes-16.svg',
              '/settings/general',
              'generalSettingsAll',
              ['manageGeneralSettings', 'showGeneralSettings']
            )}
            {this.renderBox(
              'Brands',
              '/images/icons/erxes-03.svg',
              '/settings/brands',
              'brandsAll',
              ['showBrands', 'manageBrands']
            )}
            {this.renderBox(
              'Properties',
              '/images/icons/erxes-01.svg',
              '/settings/properties',
              ''
            )}
            {this.renderBox(
              'Import & Export',
              '/images/icons/erxes-22.svg',
              '/settings/importHistories',
              'importHistoriesAll',
              ['importHistories', 'removeImportHistories', 'importXlsFile']
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__('Team Settings')}
            <span>{__('Manage your team members and their usage')}</span>
          </RowTitle>
          <div id={'SettingsTeamSettings'}>
            {this.renderBox(
              'Team Members',
              '/images/icons/erxes-23.svg',
              '/settings/team',
              'usersAll',
              teamPermissions
            )}
            {this.renderBox(
              'Permissions',
              '/images/icons/erxes-02.svg',
              '/settings/permissions',
              'permissionsAll',
              permissionActions
            )}
            {this.renderBox(
              'Skills',
              '/images/icons/erxes-29.png',
              '/settings/skills',
              'skillTypesAll',
              [
                'getSkillTypes',
                'getSkill',
                'getSkills',
                'manageSkills',
                'manageSkillTypes'
              ]
            )}
            {this.renderBox(
              'Calendars',
              '/images/icons/erxes-21.svg',
              '/settings/calendars',
              'calendarsAll',
              calendarActions
            )}
            {this.renderBox(
              'Scheduler',
              '/images/icons/erxes-14.svg',
              '/settings/schedule',
              'calendarsAll',
              calendarActions,
              'New'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__('Multipurpose Settings')}
            <span>
              {__(
                'Organize your information with secondary features used across different core features'
              )}
            </span>
          </RowTitle>
          <div id={'SettingsMultipurposeSettings'}>
            {this.renderBox(
              'Channels',
              '/images/icons/erxes-05.svg',
              '/settings/channels',
              'channelsAll',
              ['showChannels', 'manageChannels']
            )}
            {this.renderBox(
              'Integrations',
              '/images/icons/erxes-04.svg',
              '/settings/integrations',
              'integrationsAll',
              integrationSettingsActions
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
              'Widget Script Manager',
              '/images/icons/erxes-30.png',
              '/settings/scripts',
              'scriptsAll',
              ['showScripts', 'manageScripts']
            )}
            {this.renderBox(
              'Products & Services',
              '/images/icons/erxes-31.png',
              '/settings/product-service',
              'productsAll',
              productPermissions
            )}
            {this.renderBox(
              'Growth Hacking Templates',
              '/images/icons/erxes-12.svg',
              '/settings/boards/growthHackTemplate',
              'growthHacksAll',
              growthHackTemplatePermissions
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
              'Outgoing webhooks',
              '/images/icons/erxes-11.svg',
              '/settings/webhooks',
              ''
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__('Feature Settings')}
            <span>{__('Setup and manage individual core features')}</span>
          </RowTitle>
          <div id={'SettingsFeatureSettings'}>
            {this.renderBox(
              'Sales Pipelines',
              '/images/icons/erxes-25.png',
              '/settings/boards/deal',
              'dealsAll',
              dealPermissions
            )}
            {this.renderBox(
              'Task Pipelines',
              '/images/icons/erxes-13.svg',
              '/settings/boards/task',
              'tasksAll',
              taskPermissions
            )}
            {this.renderBox(
              'Ticket Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/ticket',
              'ticketsAll',
              ticketPermissions
            )}
            {this.renderBox(
              'Growth Hacking',
              '/images/icons/erxes-20.svg',
              '/settings/boards/growthHack',
              'growthHacksAll',
              growthHackPermissions
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__('Monitor')}
            <span>
              {__("Keep track of your organization's status and activity")}
            </span>
          </RowTitle>
          <div id={'SettingsMonitorSettings'}>
            {this.renderBox(
              'Status',
              '/images/icons/erxes-06.svg',
              '/settings/status',
              ''
            )}
            {this.renderBox(
              'Logs',
              '/images/icons/erxes-33.png',
              '/settings/logs',
              'viewLogs'
            )}
            {this.renderBox(
              'Email Deliveries',
              '/images/icons/erxes-27.png',
              '/settings/emailDelivery',
              ''
            )}
            {this.renderBox(
              'SMS Deliveries',
              '/images/icons/erxes-34.png',
              '/settings/sms-deliveries',
              ''
            )}
          </div>
        </Row>

        {pluginsOfSettings(this.renderBox)}
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

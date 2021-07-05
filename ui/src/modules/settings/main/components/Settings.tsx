import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { pluginsOfSettings } from 'pluginUtils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, BoxName, MenusContainer, Column, ColumnTitle } from '../styles';

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
    const content = (
      <MenusContainer id={'SettingsMain'}>
        <Column>
          <ColumnTitle>
            {__('General Settings')} &nbsp;|
            <span>{__('Set up your basic settings')}</span>
          </ColumnTitle>
          <div id={'SettingsGeneralSettings'}>
            {this.renderBox(
              'System config',
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

            {this.renderBox(
              'Outgoing webhooks',
              '/images/icons/erxes-11.svg',
              '/settings/webhooks',
              ''
            )}
          </div>
        </Column>
        <Column>
          <ColumnTitle>
            {__('Team Settings')} &nbsp;|
            <span>{__('Manage your team members and their usage')}</span>
          </ColumnTitle>
          <div id={'SettingsTeamSettings'}>
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
              'Skills',
              '/images/icons/erxes-07.svg',
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
              'Groups & Calendars',
              '/images/icons/erxes-21.svg',
              '/settings/calendars',
              'calendarsAll',
              calendarActions
            )}
            {this.renderBox(
              'Schedule',
              '/images/icons/erxes-21.svg',
              '/settings/schedule',
              'calendarsAll',
              calendarActions
            )}
          </div>
        </Column>
        <Column>
          <ColumnTitle>
            {__('Multipurpose Settings')} &nbsp;|
            <span>
              {__(
                'Organize your information with secondary features used across different core features'
              )}
            </span>
          </ColumnTitle>
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
              'Script manager',
              '/images/icons/erxes-12.svg',
              '/settings/scripts',
              'scriptsAll',
              ['showScripts', 'manageScripts']
            )}
            {this.renderBox(
              'Product & Service',
              '/images/icons/deal-insight-volume.svg',
              '/settings/product-service',
              'productsAll',
              productPermissions
            )}
            {this.renderBox(
              'Growth Hacking Templates',
              '/images/icons/erxes-21.svg',
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
          </div>
        </Column>

        <Column>
          <ColumnTitle>
            {__('Feature Settings')} &nbsp;|
            <span>{__('Setup and manage individual core features')}</span>
          </ColumnTitle>
          <div id={'SettingsFeatureSettings'}>
            {this.renderBox(
              'Sales board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/deal',
              'dealsAll',
              dealPermissions
            )}
            {this.renderBox(
              'Task board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/task',
              'tasksAll',
              taskPermissions
            )}
            {this.renderBox(
              'Ticket board & Pipelines',
              '/images/icons/erxes-19.svg',
              '/settings/boards/ticket',
              'ticketsAll',
              ticketPermissions
            )}
            {this.renderBox(
              'Marketing campaigns & Projects',
              '/images/icons/erxes-20.svg',
              '/settings/boards/growthHack',
              'growthHacksAll',
              growthHackPermissions
            )}
          </div>
        </Column>

        <Column>
          <ColumnTitle>
            {__('Monitor')} &nbsp;|
            <span>
              {__("Keep track of your organization's status and activity")}
            </span>
          </ColumnTitle>
          <div id={'SettingsMonitorSettings'}>
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
            {this.renderBox(
              'Email Deliveries',
              '/images/icons/erxes-13.svg',
              '/settings/emailDelivery',
              ''
            )}
            {this.renderBox(
              'SMS Deliveries',
              '/images/icons/erxes-08.svg',
              '/settings/sms-deliveries',
              ''
            )}
          </div>
        </Column>

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

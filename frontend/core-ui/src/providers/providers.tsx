import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { ApolloProvider } from '@apollo/client';

import apolloClient from './apollo-provider/apolloClient';

import { PluginConfigsProvidersEffect } from '@/plugins/providers/PluginConfigsProvidersEffect';
import { PluginSettingsSlotsEffect } from '@/settings/components/PluginSettingsSlotsEffect';
import { UserProviderEffect } from '@/auth/providers/UserProviderEffect';
import { OrganizationProviderEffect } from '@/organization/providers/OrganizationProviderEffect';
import { PermissionProviderEffect } from '@/auth/providers/PermissionProviderEffect';
import { WidgetsComponent } from '@/widgets/components/WidgetsComponent';
import { useRelationWidgetsModules } from '@/widgets/hooks/useRelationWidgets';
import { RelationSettingsWidgetsComponent } from '@/widgets/components/RelationSettingsWidgetsComponent';
import { useRelationSettingsWidgetsModules } from '@/widgets/hooks/useRelationSettingsWidgets';
import { RecordPickerWidgetsComponent } from '@/widgets/components/RecordPickerWidgetsComponent';
import { useRecordPickerWidgetsModules } from '@/widgets/hooks/useRecordPickerWidgets';
import {
  RecordPickerWidgetProvider,
  RelationSettingsWidgetProvider,
  RelationWidgetProvider,
  SlotProvider,
  type RenderSlotRemote,
} from 'ui-modules';
import { IconsProvider, Spinner } from 'erxes-ui';
import { optionalProvider } from '@/widgets/utils/optionalProvider';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { HostedExtensionsProvider } from '@/plugins/components/HostedExtensionsProvider';

const SafeRelationSettingsWidgetProvider = optionalProvider(
  RelationSettingsWidgetProvider,
);
const SafeRecordPickerWidgetProvider = optionalProvider(
  RecordPickerWidgetProvider,
);
const SafeSlotProvider = optionalProvider(SlotProvider);

const SlotRemote: RenderSlotRemote = ({ pluginName, expose, props }) => (
  <RenderPluginsComponent
    pluginName={`${pluginName}_ui`}
    remoteModuleName={expose}
    props={props}
  />
);

export const Providers = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <OrganizationProviderEffect />
      <UserProviderEffect />
      <PermissionProviderEffect />
      <PluginConfigsProvidersEffect />
      <PluginSettingsSlotsEffect />
      <IconsProvider>
        <RelationWidgetProvider
          RelationWidget={WidgetsComponent}
          relationWidgetsModules={useRelationWidgetsModules()}
        >
          <SafeRelationSettingsWidgetProvider
            RelationSettingsWidget={RelationSettingsWidgetsComponent}
            relationSettingsWidgetsModules={useRelationSettingsWidgetsModules()}
          >
            <SafeRecordPickerWidgetProvider
              RecordPickerWidget={RecordPickerWidgetsComponent}
              recordPickerWidgetsModules={useRecordPickerWidgetsModules()}
            >
              <SafeSlotProvider RenderRemote={SlotRemote}>
                <HostedExtensionsProvider>
                  <Suspense fallback={<Spinner withMascot />}>
                    <Outlet />
                  </Suspense>
                </HostedExtensionsProvider>
              </SafeSlotProvider>
            </SafeRecordPickerWidgetProvider>
          </SafeRelationSettingsWidgetProvider>
        </RelationWidgetProvider>
      </IconsProvider>
    </ApolloProvider>
  );
};

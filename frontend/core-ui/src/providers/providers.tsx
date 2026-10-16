import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { ApolloProvider } from '@apollo/client';

import apolloClient from './apollo-provider/apolloClient';

import { PluginConfigsProvidersEffect } from '@/plugins/providers/PluginConfigsProvidersEffect';
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
} from 'ui-modules';
import { IconsProvider } from 'erxes-ui';
import { optionalProvider } from '@/widgets/utils/optionalProvider';

const SafeRelationSettingsWidgetProvider = optionalProvider(
  RelationSettingsWidgetProvider,
);
const SafeRecordPickerWidgetProvider = optionalProvider(
  RecordPickerWidgetProvider,
);

export const Providers = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <OrganizationProviderEffect />
      <UserProviderEffect />
      <PermissionProviderEffect />
      <PluginConfigsProvidersEffect />
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
              <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
              </Suspense>
            </SafeRecordPickerWidgetProvider>
          </SafeRelationSettingsWidgetProvider>
        </RelationWidgetProvider>
      </IconsProvider>
    </ApolloProvider>
  );
};

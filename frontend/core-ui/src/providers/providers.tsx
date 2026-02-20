import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { ApolloProvider } from '@apollo/client';

import apolloClient from './apollo-provider/apolloClient';

import { PluginConfigsProvidersEffect } from '@/plugins/providers/PluginConfigsProvidersEffect';
import { UserProviderEffect } from '@/auth/providers/UserProviderEffect';
import { OrganizationProviderEffect } from '@/organization/providers/OrganizationProviderEffect';
import { WidgetsComponent } from '@/widgets/components/WidgetsComponent';
import { useRelationWidgetsModules } from '@/widgets/hooks/useRelationWidgets';
import { RelationWidgetProvider } from 'ui-modules';
import { IconsProvider } from 'erxes-ui';

export const Providers = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <OrganizationProviderEffect />
      <UserProviderEffect />
      <PluginConfigsProvidersEffect />
      <IconsProvider>
        <RelationWidgetProvider
          RelationWidget={WidgetsComponent}
          relationWidgetsModules={useRelationWidgetsModules()}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </RelationWidgetProvider>
      </IconsProvider>
    </ApolloProvider>
  );
};

import { Outlet, Navigate } from 'react-router';
import { useAtom, useAtomValue } from 'jotai';

import {
  clientConfigApiStatusState,
  currentOrganizationState,
  isCurrentOrganizationLoadedState,
  isCurrentUserLoadedState,
} from 'ui-modules';

import { isDefined } from 'erxes-ui';

import { ClientConfigError } from '@/error-handler/components/ClientConfigError';
import { AppPath } from '@/types/paths/AppPath';
import { LoadingScreen } from '@/auth/components/LoadingScreen';
import { useEffect } from 'react';

export const OrganizationProvider = () => {
  const [isCurrentOrganizationLoaded] = useAtom(
    isCurrentOrganizationLoadedState,
  );
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const [clientConfigApiStatus] = useAtom(clientConfigApiStatusState);
  const [currentOrganization] = useAtom(currentOrganizationState);

  useEffect(() => {
    if (currentOrganization?.orgShortName) {
      document.title = currentOrganization.orgShortName;
    }

    if (currentOrganization?.orgFavicon) {
      let link =
        document.querySelector<HTMLLinkElement>("link[rel='icon']") ||
        document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']");

      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = currentOrganization.orgFavicon;
    }
  }, [currentOrganization]);

  if (clientConfigApiStatus.isErrored) {
    return <ClientConfigError error={clientConfigApiStatus.error} />;
  }

  if (
    !isCurrentOrganizationLoaded ||
    !isDefined(currentOrganization) ||
    !isCurrentUserLoaded
  ) {
    return <LoadingScreen />;
  }

  if (
    isDefined(currentOrganization) &&
    !currentOrganization.hasOwner &&
    currentOrganization.type === 'os'
  ) {
    return <Navigate to={AppPath.CreateOwner} replace />;
  }

  return <Outlet />;
};

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
import { useLayoutEffect } from 'react';

export const OrganizationProvider = () => {
  const [isCurrentOrganizationLoaded] = useAtom(
    isCurrentOrganizationLoadedState,
  );
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const [clientConfigApiStatus] = useAtom(clientConfigApiStatusState);
  const [currentOrganization] = useAtom(currentOrganizationState);

  useLayoutEffect(() => {
    if (isDefined(currentOrganization)) {
      const link = document.createElement('link');
      link.id = 'favicon';
      link.rel = 'shortcut icon';
      link.href =
        'https://static-00.iconduck.com/assets.00/file-type-favicon-icon-2048x2048-q7lmo5fn.png';
      document.head.appendChild(link);
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

  if (isDefined(currentOrganization) && !currentOrganization.hasOwner) {
    return <Navigate to={AppPath.CreateOwner} replace />;
  }

  return <Outlet />;
};

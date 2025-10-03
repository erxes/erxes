import { useUsedIntegrationTypes } from '@/integrations/hooks/useUsedIntegrationTypes';
import { IconPhone } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Skeleton } from 'erxes-ui';
import { useLocation } from 'react-router-dom';

export const IntegrationNavigation = () => {
  const { integrationTypes, loading } = useUsedIntegrationTypes();
  const { pathname } = useLocation();

  if (loading) return <Skeleton className="w-32 h-4 mt-1" />;

  return (
    integrationTypes.find((type) => type._id === 'calls') && (
      <NavigationMenuLinkItem
        name="Call center"
        icon={IconPhone}
        path="frontline/calls"
        isActive={pathname.includes('/frontline/calls')}
      />
    )
  );
};

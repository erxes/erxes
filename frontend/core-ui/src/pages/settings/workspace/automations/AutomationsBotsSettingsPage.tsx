import { AutomationsBotsSettings } from '@/automations/components/settings/components/bots/components/AutomationsBotsSettings';
import { Suspense } from 'react';
import { Spinner } from 'erxes-ui';
import { useOutlet } from 'react-router';

export const AutomationsBotsSettingsPage = () => {
  const outlet = useOutlet();
  return (
    <Suspense fallback={<Spinner />}>
      {outlet || <AutomationsBotsSettings />}
    </Suspense>
  );
};

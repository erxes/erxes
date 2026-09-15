import { useQuery } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { VIBER_SETUP } from '../graphql';
import type { ViberSetup } from '../types';
import { ViberIntegrationForm } from './ViberIntegrationForm';
import { ViberSetupCheck } from './ViberSetupCheck';

export const ViberIntegrationDetail = ({
  channelId,
}: {
  channelId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canRead = isLoaded && hasActionPermission('showIntegrations');
  const canAdd = isLoaded && hasActionPermission('integrationsAdd');
  const setup = useQuery<{ viberSetup: ViberSetup }>(VIBER_SETUP, {
    skip: !canRead,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  if (!canRead) return null;

  return (
    <div className="space-y-4">
      {canAdd && (
        <Sheet open={open} onOpenChange={(value) => !saving && setOpen(value)}>
          <Sheet.Trigger asChild>
            <Button
              disabled={
                setup.loading ||
                !setup.data ||
                Boolean(setup.data.viberSetup.webhookError)
              }
            >
              <IconPlus />
              {t('add-integration', { defaultValue: 'Add integration' })}
            </Button>
          </Sheet.Trigger>
          <Sheet.View className="sm:max-w-lg">
            <ViberIntegrationForm
              channelId={channelId}
              saving={saving}
              onSavingChange={setSaving}
              onClose={() => setOpen(false)}
            />
          </Sheet.View>
        </Sheet>
      )}
      <ViberSetupCheck
        setup={setup.data?.viberSetup}
        loading={setup.loading}
        error={setup.error?.message}
        refresh={() => void setup.refetch().catch(() => undefined)}
        canEdit={isLoaded && hasActionPermission('integrationsEdit')}
      />
    </div>
  );
};

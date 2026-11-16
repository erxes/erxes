import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useJSONRemoveButton } from '@/automations/components/builder/nodes/actions/webhooks/hooks/useJSONRemoveButton';

type OutgoinWebhookBodyPath = Array<string | number>;

interface JSONRemoveButtonProps {
  name: string;
  path: OutgoinWebhookBodyPath;
}

export const JSONRemoveButton = memo(function JSONRemoveButton({
  name,
  path,
}: JSONRemoveButtonProps) {
  const { t } = useTranslation('automations');
  const onRemove = useJSONRemoveButton(name, path);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onRemove}
      aria-label={t('webhook-json-remove')}
    >
      <IconTrash />
    </Button>
  );
});

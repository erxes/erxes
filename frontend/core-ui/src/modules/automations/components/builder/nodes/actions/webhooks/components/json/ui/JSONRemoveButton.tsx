import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { deleteAtJSONProperty } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';

type OutgoinWebhookBodyPath = Array<string | number>;

interface JSONRemoveButtonProps {
  name: string;
  path: OutgoinWebhookBodyPath;
}

export const JSONRemoveButton = memo(function JSONRemoveButton({
  name,
  path,
}: JSONRemoveButtonProps) {
  const { getValues, setValue } = useFormContext();

  const onRemove = () => {
    const root = getValues();
    const next = deleteAtJSONProperty(root, path);
    setValue(name, next[name], { shouldDirty: true, shouldTouch: true });
  };

  return (
    <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove">
      <IconTrash />
    </Button>
  );
});

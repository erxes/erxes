import { Spinner } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useIntegrationRemove } from '@/integrations/hooks/useIntegrationRemove';

export const RemoveIntegration = ({
  _id,
  name,
}: {
  _id: string;
  name: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { handleRemove, loading } = useIntegrationRemove({ _id, name });

  return (
    <div
      onClick={handleRemove}
      className="flex items-center gap-2 w-full text-destructive"
    >
      {loading ? <Spinner className="size-4" /> : <IconTrash size={16} />}
      {t('remove')}
    </div>
  );
};

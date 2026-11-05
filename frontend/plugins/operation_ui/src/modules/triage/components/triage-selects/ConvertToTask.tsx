import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ConvertToTask = ({
  triageId,
  size,
}: {
  triageId: string;
  // `sm` in the side panel's top bar.
  size?: 'sm';
}) => {
  const { t } = useTranslation('operation');
  const { convertTriageToTask, loading } = useConvertTriage();

  const handleConvert = () => {
    convertTriageToTask({ variables: { id: triageId } });
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleConvert}
      disabled={loading}
    >
      {t('accept-as-task')}
    </Button>
  );
};

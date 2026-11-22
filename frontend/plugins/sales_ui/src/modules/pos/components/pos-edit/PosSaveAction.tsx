import { Badge, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface PosSaveActionProps {
  isDirty: boolean;
  saving: boolean;
  form?: string;
  onClick?: () => void;
}

export const PosSaveAction = ({
  isDirty,
  saving,
  form,
  onClick,
}: PosSaveActionProps) => {
  const { t } = useTranslation('sales');

  return (
    <>
      {isDirty && !saving && (
        <Badge variant="secondary" className="font-normal">
          {t('unsaved-changes', 'Unsaved changes')}
        </Badge>
      )}
      <Button
        type={form ? 'submit' : 'button'}
        form={form}
        size="sm"
        disabled={!isDirty || saving}
        onClick={onClick}
      >
        {saving && <Spinner size="sm" />}
        {saving ? t('saving') : t('save-changes')}
      </Button>
    </>
  );
};

import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  activeIndex: number | null;
  loading: boolean;
  onClear: () => void;
  onSave: () => void;
  onDelete: () => void;
};

const ConfigFooter: React.FC<Props> = ({
  activeIndex,
  loading,
  onClear,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation('mongolian');
  return (
    <div className="flex items-center justify-between py-6 border-t">
      {activeIndex !== null && (
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={loading}
          className="text-xs"
        >
          {t('delete-config')}
        </Button>
      )}
      <div className="flex gap-3 ml-auto">
        <Button
          variant="outline"
          onClick={onClear}
          disabled={loading}
          className="text-xs"
        >
          {t('clear')}
        </Button>
        <Button onClick={onSave} disabled={loading} className="text-xs">
          {loading ? t('saving') : t('save-config')}
        </Button>
      </div>
    </div>
  );
};

export default ConfigFooter;

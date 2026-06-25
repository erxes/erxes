import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  onNew: () => void;
  disabled?: boolean;
};

const ConfigHeader: React.FC<Props> = ({ title, onNew, disabled }) => {
  const { t } = useTranslation('mongolian');
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t('manage-product-placement')}
        </p>
      </div>
      <Button
        onClick={onNew}
        disabled={disabled}
        className="text-sm"
      >
        + {t('new-config')}
      </Button>
    </div>
  );
};

export default ConfigHeader;

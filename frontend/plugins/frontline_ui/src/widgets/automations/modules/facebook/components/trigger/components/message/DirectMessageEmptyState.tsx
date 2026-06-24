import { IconMessageSearch } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DirectMessageEmptyState = ({
  onAddFirstCondition,
}: {
  onAddFirstCondition: () => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
        <IconMessageSearch className="size-5" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">{t('no-direct-message-conditions')}</p>
        <p className="text-xs text-muted-foreground">
          {t('no-conditions-hint')}
        </p>
      </div>

      <Button className="mt-4" onClick={onAddFirstCondition}>
        {t('add-optional-condition')}
      </Button>
    </div>
  );
};

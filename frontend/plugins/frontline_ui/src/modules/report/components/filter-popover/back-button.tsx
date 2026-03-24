import { Command, useFilterContext } from 'erxes-ui';
import { IconChevronLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const BackButton = () => {
  const { t } = useTranslation();
  const { setView } = useFilterContext();
  return (
    <Command.Item
      value="back"
      onSelect={() => setView('root')}
      className="text-sm"
    >
      <IconChevronLeft className="w-3 h-3" />
      {t('back')}
    </Command.Item>
  );
};

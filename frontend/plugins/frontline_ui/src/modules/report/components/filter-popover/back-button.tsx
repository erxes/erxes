import { Command, useFilterContext } from 'erxes-ui';
import { IconChevronLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const BackButton = ({ view = 'root' }: { view?: string }) => {
  const { t } = useTranslation();
  const { setView } = useFilterContext();
  return (
    <Command.Item
      value="back"
      onSelect={() => setView(view)}
      className="text-sm"
    >
      <IconChevronLeft className="w-3 h-3" />
      {t('back')}
    </Command.Item>
  );
};

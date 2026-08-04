import { Command } from 'erxes-ui';
import { SOURCE_OPTIONS } from '@/report/constants/data';
import { useTranslation } from 'react-i18next';

export const SourceFilter = ({
  setView,
}: {
  setView: (view: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {SOURCE_OPTIONS.map((option) => (
        <Command.Item key={option.value} value={option.value}>
          {t(option.label)}
        </Command.Item>
      ))}
    </Command.List>
  );
};

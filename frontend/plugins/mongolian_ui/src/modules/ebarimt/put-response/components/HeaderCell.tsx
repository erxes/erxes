import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const HeaderCell = ({ icon, label }: { icon: any; label: string }) => {
  const { t } = useTranslation('mongolian');
  return <RecordTable.InlineHead icon={icon} label={t(label)} />;
};

import { Icon } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const HeaderCell = ({
  icon: IconComponent,
  label,
}: {
  icon: Icon;
  label: string;
}) => {
  const { t } = useTranslation('mongolian');
  return <RecordTable.InlineHead icon={IconComponent} label={t(label)} />;
};

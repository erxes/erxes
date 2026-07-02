import { Icon } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** table header cell with icon and translated label. */
export const HeaderCell = ({
  icon: Icon,
  labelKey,
}: {
  icon: Icon;
  labelKey: string;
}) => {
  const { t } = useTranslation('accounting');
  return <RecordTable.InlineHead icon={Icon} label={t(labelKey)} />;
};

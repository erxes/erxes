import { IconListDetails } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

type Props = {
  formId: string;
};
export const OpenSubmissionsAction: FC<Props> = ({ formId }) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  return (
    <DropdownMenu.Item
      title={t('open-submissions-list')}
      onSelect={() => navigate(`submissions/${formId}`)}
    >
      <IconListDetails /> {t('submissions')}
    </DropdownMenu.Item>
  );
};

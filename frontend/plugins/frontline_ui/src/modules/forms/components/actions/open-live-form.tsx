import { IconExternalLink } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { REACT_APP_WIDGETS_URL } from '@/utils';
import { useTranslation } from 'react-i18next';

type Props = {
  formId: string;
  channelId: string;
};

export const OpenLiveForm: FC<Props> = ({ formId, channelId }) => {
  const { t } = useTranslation('frontline');
  return (
    <Link
      target="_blank"
      to={`${REACT_APP_WIDGETS_URL}/live/${channelId}/${formId}`}
    >
      <DropdownMenu.Item title={t('open-live-form')}>
        <IconExternalLink /> {t('open-live-form')}
      </DropdownMenu.Item>
    </Link>
  );
};

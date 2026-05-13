import { IconExternalLink } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { REACT_APP_WIDGETS_URL } from '@/utils';

type Props = {
  formId: string;
  channelId: string;
};

export const OpenLiveForm: FC<Props> = ({ formId, channelId }) => {
  return (
    <Link
      target="_blank"
      to={`${REACT_APP_WIDGETS_URL}/live/${channelId}/${formId}`}
    >
      <DropdownMenu.Item title="Open live code">
        <IconExternalLink /> Open live code
      </DropdownMenu.Item>
    </Link>
  );
};

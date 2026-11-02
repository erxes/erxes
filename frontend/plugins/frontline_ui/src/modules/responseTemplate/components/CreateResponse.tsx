import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ResponseHotkeyScope } from '@/responseTemplate/types/ResponseHotkeyScope';
import { useSidePanel } from 'ui-modules';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';

export const CreateResponse = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { id: channelId } = useSettingsParams();
  const { openRecord, record } = useSidePanel();
  const onOpen = () => {
    if (channelId)
      openRecord(
        {
          contentType: RESPONSE_TEMPLATE_CONTENT_TYPE,
          contentId: `new~${channelId}`,
        },
        { stack: Boolean(record) },
      );
  };
  useScopedHotkeys(
    'c',
    () => {
      if (!record) onOpen();
    },
    ResponseHotkeyScope.ResponseSettingsPage,
  );
  if (!channelId) return null;
  return (
    <Button onClick={onOpen}>
      <IconPlus />
      {t('create-response-template', 'Create response template')}
      <Kbd>C</Kbd>
    </Button>
  );
};

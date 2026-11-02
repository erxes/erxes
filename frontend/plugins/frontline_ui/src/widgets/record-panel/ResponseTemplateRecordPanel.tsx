import { ResponseTemplateEditor } from '@/responseTemplate/components/ResponseDetail';
import { useGetResponse } from '@/responseTemplate/hooks/useGetRespone';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import {
  SettingsPanelContext,
  useSettingsParams,
} from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

const getResponsePanelChannelId = (
  response: ReturnType<typeof useGetResponse>['response'],
  encodedChannelId: string | undefined,
  draftChannelId: string | undefined,
  routeChannelId: string | undefined,
): string | undefined =>
  response?.channelId || encodedChannelId || draftChannelId || routeChannelId;

const ResponseTemplateUnavailable = ({ error }: { error?: Error }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('response-template', 'Response Template')}</Empty.Title>
        <Empty.Description>
          {error?.message || t('not-found', { keyPrefix: '' })}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const ResponseTemplateDraftActivity = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { setTab } = useSidePanel();
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('response-template', 'Response Template')}</Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={() => setTab('detail')}>
          {t('create', 'Create')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};

export const ResponseTemplateRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const [draftPrefix, encodedChannelId] = contentId.split('~');
  const isNew = draftPrefix === 'new';
  const { response, loading, error } = useGetResponse(
    isNew ? undefined : contentId,
  );
  const draft = useSidePanelDraft<{ channelId: string }>(
    RESPONSE_TEMPLATE_CONTENT_TYPE,
  );
  const { id } = useSettingsParams();
  const { back, canGoBack, close } = useSidePanel();
  const onClose = () => (canGoBack ? back() : close());
  if (view === 'title')
    return response?.name || t('response-template', 'Response Template');
  if (view === 'actions') return null;
  if (!isNew && loading && !response)
    return <Spinner containerClassName="py-12" />;
  const channelId = getResponsePanelChannelId(
    response,
    encodedChannelId,
    draft.channelId,
    id,
  );
  if ((!isNew && !response) || !channelId)
    return <ResponseTemplateUnavailable error={error} />;
  if (view === 'activity')
    return isNew ? (
      <ResponseTemplateDraftActivity />
    ) : (
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    );
  return (
    <SettingsPanelContext.Provider value={{ channelId }}>
      <SettingsPanelForm>
        <ResponseTemplateEditor
          key={contentId}
          response={response}
          channelId={channelId}
          onClose={onClose}
        />
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};

import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreateResponseForm } from './CreateResponseForm';
import { Spinner, toast, useScopedHotkeys, useSetHotkeyScope } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUpdateResponse } from '@/responseTemplate/hooks/useUpdateResponses';
import { useResponseAdd } from '@/responseTemplate/hooks/useAddResponse';
import {
  TCreateResponseForm,
  TUpdateResponseForm,
} from '@/responseTemplate/types';
import { getSidePanelRecordPath, useSidePanel } from 'ui-modules';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { ResponseHotkeyScope } from '@/responseTemplate/types/ResponseHotkeyScope';
import { useGetResponse } from '../hooks/useGetRespone';

type ResponseRecord = NonNullable<
  ReturnType<typeof useGetResponse>['response']
>;

export const ResponseTemplateEditor = ({
  response,
  channelId,
  onClose,
}: {
  response?: ResponseRecord;
  channelId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { openRecord } = useSidePanel();
  const isEditing = Boolean(response);
  const setHotkeyScope = useSetHotkeyScope();
  const hotkeyScope = isEditing
    ? ResponseHotkeyScope.ResponseDetail
    : ResponseHotkeyScope.ResponseAddSheet;
  useEffect(() => {
    setHotkeyScope(hotkeyScope);
    return () => setHotkeyScope(ResponseHotkeyScope.ResponseSettingsPage);
  }, [hotkeyScope, setHotkeyScope]);
  useScopedHotkeys('esc', onClose, hotkeyScope, [onClose]);
  const { updateResponse, loading: updating } = useUpdateResponse();
  const { addResponse, loading: adding } = useResponseAdd();
  const onCompleted = () => {
    toast({ title: t('success', 'Success!') });
    onClose();
  };
  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });
  const create = (data: TCreateResponseForm) =>
    addResponse({
      variables: { ...data, channelId },
      onCompleted: (result) => {
        toast({ title: t('success', 'Success!') });
        const createdId = result.responseTemplatesAdd?._id;
        if (createdId)
          openRecord(
            {
              contentType: RESPONSE_TEMPLATE_CONTENT_TYPE,
              contentId: createdId,
            },
            { replace: true },
          );
        else onClose();
      },
      onError,
    });
  const update = (data: TUpdateResponseForm) =>
    updateResponse({
      variables: { ...data, id: data._id },
      onCompleted,
      onError,
    });
  return response ? (
    <CreateResponseForm
      type="update"
      defaultValues={{
        _id: response._id,
        name: response.name ?? '',
        content: response.content ?? '',
      }}
      onSubmit={update}
      loading={updating}
      onCancel={onClose}
    />
  ) : (
    <CreateResponseForm
      type="create"
      defaultValues={{ name: '', content: '', channelId }}
      onSubmit={create}
      loading={adding}
      onCancel={onClose}
    />
  );
};

export const ResponseDetail = () => {
  const { id: channelId, responseId } = useParams<{
    id: string;
    responseId: string;
  }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    if (!channelId || !responseId) return;
    const queries = new URLSearchParams(search);
    queries.set(
      'panel',
      getSidePanelRecordPath({
        contentType: RESPONSE_TEMPLATE_CONTENT_TYPE,
        contentId: responseId,
      }),
    );
    navigate(
      {
        pathname: `/frontline/settings/channels/${channelId}/response`,
        search: queries.toString(),
      },
      { replace: true },
    );
  }, [channelId, navigate, responseId, search]);
  return <Spinner containerClassName="py-12" />;
};

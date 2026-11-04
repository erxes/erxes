import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreateResponseForm } from './CreateResponseForm';
import {
  Spinner,
  toast,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUpdateResponse } from '@/responseTemplate/hooks/useUpdateResponses';
import { useResponseAdd } from '@/responseTemplate/hooks/useAddResponse';
import {
  TCreateResponseForm,
  TUpdateResponseForm,
  TResponseForm,
} from '@/responseTemplate/types';
import { getSidePanelRecordPath, useSidePanel } from 'ui-modules';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { ResponseHotkeyScope } from '@/responseTemplate/types/ResponseHotkeyScope';
import { useGetResponse } from '../hooks/useGetRespone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_RESPONSE_FORM_SCHEMA,
  UPDATE_RESPONSE_FORM_SCHEMA,
} from '@/settings/schema/response';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { responsePanelDraftsState } from '@/responseTemplate/states/responsePanelDrafts';

type ResponseRecord = NonNullable<
  ReturnType<typeof useGetResponse>['response']
>;

/** Edits or creates a response template while preserving panel drafts. */
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
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const hotkeyScope = isEditing
    ? ResponseHotkeyScope.ResponseDetail
    : ResponseHotkeyScope.ResponseAddSheet;
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
    return goBackToPreviousHotkeyScope;
  }, [
    hotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  ]);
  useScopedHotkeys('esc', onClose, hotkeyScope, [onClose]);
  const values: TResponseForm = response
    ? {
        name: response.name ?? '',
        content: response.content ?? '',
        _id: response._id,
      }
    : { name: '', content: '', channelId };
  const form = useForm<TResponseForm>({
    resolver: zodResolver(
      response ? UPDATE_RESPONSE_FORM_SCHEMA : CREATE_RESPONSE_FORM_SCHEMA,
    ),
    defaultValues: values,
  });
  const { clearDraft, markSaved, isActive, beginSave, endSave, saving } =
    usePanelFormDraft({
      form,
      recordKey: response?._id ?? `new~${channelId}`,
      values,
      draftsState: responsePanelDraftsState,
      isNew: !response,
    });
  /** Discards this draft and closes its editor. */
  const onCancel = () => {
    clearDraft();
    onClose();
  };
  const { updateResponse, loading: updating } = useUpdateResponse();
  const { addResponse, loading: adding } = useResponseAdd();
  /** Displays a response template mutation error. */
  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });
  /** Creates a response template and opens the saved record. */
  const create = (data: TCreateResponseForm) => {
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    const submittedValues = structuredClone(form.getValues());
    return addResponse({
      variables: data,
      onCompleted: (result) => {
        endSave(saveId);
        toast({ title: t('success', 'Success!') });
        if (!markSaved(data, submittedValues) || !isActive()) return;
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
      onError: (error) => {
        endSave(saveId);
        onError(error);
      },
    });
  };
  /** Saves changes to the current response template. */
  const update = (data: TUpdateResponseForm) => {
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    if (!response) {
      endSave(saveId);
      return undefined;
    }
    const submittedValues = structuredClone(form.getValues());
    return updateResponse({
      variables: { ...data, id: response._id },
      onCompleted: () => {
        endSave(saveId);
        toast({ title: t('success', 'Success!') });
        markSaved(data, submittedValues);
      },
      onError: (error) => {
        endSave(saveId);
        onError(error);
      },
    });
  };
  /** Dispatches validated values to the create or update mutation. */
  const onSubmit = (data: TResponseForm) => {
    if (response && '_id' in data) return update(data);
    else if (!response && 'channelId' in data) return create(data);
    return undefined;
  };
  return (
    <CreateResponseForm
      type={response ? 'update' : 'create'}
      form={form}
      onSubmit={onSubmit}
      loading={adding || updating || saving}
      onCancel={onCancel}
    />
  );
};

/** Redirects legacy response detail links to the record panel. */
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

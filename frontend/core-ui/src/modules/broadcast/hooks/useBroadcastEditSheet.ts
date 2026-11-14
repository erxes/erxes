import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import type { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import { useBroadcastMessage } from '@/broadcast/hooks/useBroadcastMessage';
import { IBroadcastMethodEnum } from '@/broadcast/types';
import { broadcastPageSearch } from '@/broadcast/utils/broadcastPageSearch';
import { messageToFormValues } from '@/broadcast/utils/messageToFormValues';
import {
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useMultiQueryState } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

type TBroadcastEditPageState = {
  broadcastDraft?: {
    messageId: string;
    values: IBroadcastFormData;
    step: number;
  };
};

type TBroadcastEditQueryParams = {
  editMessageId: string;
  method: IBroadcastMethodEnum;
};

const broadcastPathOf = (messageId: string, search: string, suffix = '') =>
  `/broadcasts/${encodeURIComponent(messageId)}${suffix}${broadcastPageSearch(
    search,
  )}`;

/**
 * Which campaign the edit sheet holds (from the route on the full page, from
 * the query otherwise), closing it, and expanding it to the full page with
 * the draft carried over.
 */
export const useBroadcastEditSheet = (page: boolean) => {
  const [{ editMessageId: queryId, method }, setQueryParams] =
    useMultiQueryState<TBroadcastEditQueryParams>(['editMessageId', 'method']);
  const { messageId: routeId } = useParams<{ messageId: string }>();
  const editMessageId = page ? routeId : queryId;
  const navigate = useNavigate();
  const { search } = useLocation();

  const handleClose = useCallback(() => {
    if (page) {
      navigate(broadcastPathOf(editMessageId || '', search));
      return;
    }

    setQueryParams({ editMessageId: null, method: null });
  }, [page, navigate, editMessageId, search, setQueryParams]);

  const openPage = useCallback(
    (values?: IBroadcastFormData, step = 0) => {
      if (!editMessageId) {
        return;
      }

      const broadcastDraft = values
        ? { messageId: editMessageId, values, step }
        : undefined;

      navigate(broadcastPathOf(editMessageId, search, '/edit'), {
        state: { broadcastDraft },
      });
    },
    [editMessageId, navigate, search],
  );

  const pagePanel = usePagePanel({
    page,
    maxWidth: 1200,
    defaultWidth: 900,
    name: 'broadcast/BroadcastEditSheet',
    open: !!editMessageId,
    onOpenChange: (open) => !open && handleClose(),
    identity: editMessageId || 'new',
    onExpand: page ? undefined : () => openPage(),
  });

  return {
    editMessageId,
    method,
    pagePanel,
    handleClose,
    // The full page has nowhere further to expand to
    onExpand: page ? undefined : openPage,
  };
};

/**
 * The campaign being edited and its starting values: a draft carried over
 * from the sheet wins, otherwise the stored campaign with its flow.
 */
export const useBroadcastEditSheetContent = (messageId: string) => {
  const entry = usePagePanelContext();
  const location = useLocation();
  const state: TBroadcastEditPageState | null = location.state;
  const draft =
    entry.page && state?.broadcastDraft?.messageId === messageId
      ? state.broadcastDraft
      : undefined;
  const { message, loading, error, refetch } = useBroadcastMessage({
    variables: { _id: messageId },
  });

  // A workflow campaign keeps its flow on the automation it owns, not on the
  // campaign, so the steps cannot be filled in until that has loaded too.
  const { automation, loading: loadingAutomation } = useAutomationDetail(
    message?.workflowAutomationId,
  );

  const initialValues = useMemo(
    () =>
      draft?.values ??
      messageToFormValues(message, {
        actions: automation?.actions,
        entryActionId: automation?.triggers?.[0]?.actionId,
      }),
    [message, automation, draft],
  );

  // The flow editor seeds its own form once, from the value it mounts with, so
  // the steps must not be rendered before the flow is there to seed it with.
  const isMissingFlow = !!message?.workflowAutomationId && !automation;
  const isLoaded = !loading && !loadingAutomation;

  return {
    entry,
    error,
    retry: () => refetch(),
    notFound: !loading && !message?._id,
    flowFailed: isLoaded && isMissingFlow,
    loading: !isLoaded || isMissingFlow,
    initialValues,
    initialStep: draft?.step,
  };
};

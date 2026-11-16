import {
  CHANNEL_CONTENT_TYPE,
  CHANNEL_MEMBERS_CONTENT_TYPE,
  FORM_SUBMISSION_CONTENT_TYPE,
  PIPELINE_CONTENT_TYPE,
  RESPONSE_TEMPLATE_CONTENT_TYPE,
  TICKET_CONFIG_CONTENT_TYPE,
  TICKET_STATUS_CONTENT_TYPE,
} from '@/settings/constants/recordPanels';
import { Spinner } from 'erxes-ui';
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import {
  NEW_RECORD_ID,
  type IRecordPanelProps,
  useSidePanel,
} from 'ui-modules';

const panels: Record<
  string,
  LazyExoticComponent<ComponentType<IRecordPanelProps>>
> = {
  [CHANNEL_CONTENT_TYPE]: lazy(() =>
    import('./ChannelRecordPanel').then((module) => ({
      default: module.ChannelRecordPanel,
    })),
  ),
  [CHANNEL_MEMBERS_CONTENT_TYPE]: lazy(() =>
    import('./ChannelMembersRecordPanel').then((module) => ({
      default: module.ChannelMembersRecordPanel,
    })),
  ),
  [PIPELINE_CONTENT_TYPE]: lazy(() =>
    import('./PipelineRecordPanel').then((module) => ({
      default: module.PipelineRecordPanel,
    })),
  ),
  [TICKET_STATUS_CONTENT_TYPE]: lazy(() =>
    import('./TicketStatusRecordPanel').then((module) => ({
      default: module.TicketStatusRecordPanel,
    })),
  ),
  [TICKET_CONFIG_CONTENT_TYPE]: lazy(() =>
    import('./TicketConfigRecordPanel').then((module) => ({
      default: module.TicketConfigRecordPanel,
    })),
  ),
  [RESPONSE_TEMPLATE_CONTENT_TYPE]: lazy(() =>
    import('./ResponseTemplateRecordPanel').then((module) => ({
      default: module.ResponseTemplateRecordPanel,
    })),
  ),
  [FORM_SUBMISSION_CONTENT_TYPE]: lazy(() =>
    import('@/forms/components/submissions/components/submission-details').then(
      (module) => ({ default: module.FormSubmissionRecordPanel }),
    ),
  ),
};

/** Lazy-loads the settings panel registered for the requested content type. */
export const SettingsRecordPanel = (props: IRecordPanelProps) => {
  const { contentType, contentId, view } = props;
  const { record, openNewRecord } = useSidePanel();
  const normalizedDraft = useRef<string>();
  useEffect(() => {
    const [prefix, scopeId, detailId] = contentId.split('~');
    if (
      view !== 'title' ||
      record?.contentType !== contentType ||
      record.contentId !== contentId ||
      prefix !== NEW_RECORD_ID ||
      !scopeId
    ) {
      normalizedDraft.current = undefined;
      return;
    }
    const sourceKey = JSON.stringify([contentType, contentId]);
    if (normalizedDraft.current === sourceKey) return;
    let defaults: Record<string, unknown>;
    switch (contentType) {
      case PIPELINE_CONTENT_TYPE:
      case RESPONSE_TEMPLATE_CONTENT_TYPE:
        defaults = { channelId: scopeId };
        break;
      case TICKET_STATUS_CONTENT_TYPE: {
        const parsedType = Number(detailId);
        const statusType =
          Number.isInteger(parsedType) && parsedType >= 1 && parsedType <= 6
            ? parsedType
            : 1;
        defaults = { pipelineId: scopeId, statusType };
        break;
      }
      case TICKET_CONFIG_CONTENT_TYPE:
        if (!detailId) return;
        defaults = { channelId: scopeId, pipelineId: detailId };
        break;
      default:
        return;
    }
    normalizedDraft.current = sourceKey;
    openNewRecord(contentType, defaults, { replace: true });
  }, [
    contentType,
    contentId,
    view,
    record?.contentType,
    record?.contentId,
    openNewRecord,
  ]);
  const Panel = panels[props.contentType];
  if (!Panel) return null;

  return (
    <Suspense fallback={<Spinner containerClassName="py-12" />}>
      <Panel key={`${props.contentType}:${props.contentId}`} {...props} />
    </Suspense>
  );
};

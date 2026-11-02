import {
  CHANNEL_CONTENT_TYPE,
  CHANNEL_MEMBERS_CONTENT_TYPE,
  FORM_SUBMISSION_CONTENT_TYPE,
  PIPELINE_CONTENT_TYPE,
  PIPELINE_LAYOUT_CONTENT_TYPE,
  RESPONSE_TEMPLATE_CONTENT_TYPE,
  TICKET_CONFIG_CONTENT_TYPE,
  TICKET_STATUS_CONTENT_TYPE,
} from '@/settings/constants/recordPanels';
import { Spinner } from 'erxes-ui';
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import type { IRecordPanelProps } from 'ui-modules';

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
  [PIPELINE_LAYOUT_CONTENT_TYPE]: lazy(() =>
    import('./PipelineLayoutRecordPanel').then((module) => ({
      default: module.PipelineLayoutRecordPanel,
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

export const SettingsRecordPanel = (props: IRecordPanelProps) => {
  const Panel = panels[props.contentType];
  if (!Panel) return null;

  return (
    <Suspense fallback={<Spinner containerClassName="py-12" />}>
      <Panel key={`${props.contentType}:${props.contentId}`} {...props} />
    </Suspense>
  );
};

import { getSidePanelRecordPath } from 'ui-modules';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';

export const PIPELINE_TAB_SEGMENTS = {
  general: '',
  statuses: 'statuses',
  configs: 'configs',
  permissions: 'permissions',
  properties: 'properties',
  mail: 'mail',
} as const;

export type TPipelineTabSegment =
  (typeof PIPELINE_TAB_SEGMENTS)[keyof typeof PIPELINE_TAB_SEGMENTS];

export const PIPELINE_TABS: {
  segment: TPipelineTabSegment;
  labelKey: string;
  defaultLabel?: string;
}[] = [
  { segment: PIPELINE_TAB_SEGMENTS.general, labelKey: 'general' },
  { segment: PIPELINE_TAB_SEGMENTS.statuses, labelKey: 'ticket-statuses' },
  { segment: PIPELINE_TAB_SEGMENTS.configs, labelKey: 'configuration' },
  { segment: PIPELINE_TAB_SEGMENTS.permissions, labelKey: 'permissions' },
  {
    segment: PIPELINE_TAB_SEGMENTS.properties,
    labelKey: 'properties',
    defaultLabel: 'Properties',
  },
  {
    segment: PIPELINE_TAB_SEGMENTS.mail,
    labelKey: 'pipeline-mail',
    defaultLabel: 'Mail settings',
  },
];

/** Encodes a saved pipeline and optional settings section as a panel ID. */
export const getPipelineRecordId = (
  pipelineId: string,
  segment: TPipelineTabSegment = '',
): string => (segment ? `${pipelineId}~${segment}` : pipelineId);

/** Encodes the owning channel in a new pipeline's panel ID. */
export const getPipelineDraftId = (channelId: string): string =>
  `new~${channelId}`;

/** Decodes a pipeline panel ID into record, draft scope, and section values. */
export const parsePipelineRecordId = (
  contentId: string,
): {
  pipelineId: string | undefined;
  channelId: string | undefined;
  segment: TPipelineTabSegment;
  isNew: boolean;
} => {
  const [recordId, section] = contentId.split('~');
  const isNew = recordId === 'new';
  return {
    pipelineId: isNew ? undefined : recordId || undefined,
    channelId: isNew ? section : undefined,
    segment:
      PIPELINE_TABS.find((tab) => tab.segment === section)?.segment ?? '',
    isNew,
  };
};

/** Builds the channel settings URL that opens a pipeline panel section. */
export const getPipelinePath = (
  channelId: string,
  pipelineId: string,
  segment: TPipelineTabSegment,
) => {
  const panel = getSidePanelRecordPath({
    contentType: PIPELINE_CONTENT_TYPE,
    contentId: getPipelineRecordId(pipelineId, segment),
  });
  return `/frontline/settings/channels/${channelId}/pipelines?${new URLSearchParams({ panel })}`;
};

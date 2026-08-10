export const PIPELINE_TAB_SEGMENTS = {
  general: '',
  statuses: 'statuses',
  configs: 'configs',
  permissions: 'permissions',
} as const;

export type TPipelineTabSegment =
  (typeof PIPELINE_TAB_SEGMENTS)[keyof typeof PIPELINE_TAB_SEGMENTS];

export const PIPELINE_TABS: {
  segment: TPipelineTabSegment;
  labelKey: string;
}[] = [
  { segment: PIPELINE_TAB_SEGMENTS.general, labelKey: 'general' },
  { segment: PIPELINE_TAB_SEGMENTS.statuses, labelKey: 'ticket-statuses' },
  { segment: PIPELINE_TAB_SEGMENTS.configs, labelKey: 'configuration' },
  { segment: PIPELINE_TAB_SEGMENTS.permissions, labelKey: 'permissions' },
];

export const getPipelinePath = (
  channelId: string,
  pipelineId: string,
  segment: TPipelineTabSegment,
) => {
  const base = `/settings/frontline/channels/${channelId}/pipelines/${pipelineId}`;

  return segment ? `${base}/${segment}` : base;
};

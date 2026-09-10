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
  { segment: PIPELINE_TAB_SEGMENTS.properties, labelKey: 'properties' },
  {
    segment: PIPELINE_TAB_SEGMENTS.mail,
    labelKey: 'pipeline-mail',
    defaultLabel: 'Mail settings',
  },
];

export const getPipelinePath = (
  channelId: string,
  pipelineId: string,
  segment: TPipelineTabSegment,
) => {
  const base = `/settings/frontline/channels/${channelId}/pipelines/${pipelineId}`;

  return segment ? `${base}/${segment}` : base;
};

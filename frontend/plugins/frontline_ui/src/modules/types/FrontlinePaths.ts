export enum FrontlinePaths {
  IntegrationConfig = '/config',
  ErxesMessengerPreview = '/erxes-messenger-preview',
  Channels = '/channels',
  ChannelDetails = '/:id',
  ChannelMembers = '/:id/members',
  ChannelIntegrations = 'details/:id/:integrationType',
  ChannelPipelines = '/:id/pipelines',
  PipelineDetail = '/:id/pipelines/:pipelineId',
}

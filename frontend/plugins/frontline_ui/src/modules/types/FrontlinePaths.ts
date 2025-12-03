export enum FrontlinePaths {
  IntegrationConfig = '/config',
  ErxesMessengerPreview = '/erxes-messenger-preview',
  Channels = '/channels',
  ChannelDetails = '/:id',
  ChannelMembers = '/:id/members',
  ChannelIntegrations = 'details/:id/:integrationType',
  FbAuth = '/fb-auth',
  ChannelPipelines = '/:id/pipelines',
  PipelineDetail = '/:id/pipelines/:pipelineId',
  Tickets = '/tickets',
  TicketsConfigs = '/:id/pipelines/:pipelineId/configs',
  ChannelResponsePage = '/:id/response',
  ResponseDetail = '/:id/response/:responseId',
  TicketsStatuses = '/:id/pipelines/:pipelineId/statuses',

}

import { QueryResponse } from 'modules/common/types';
import { IActivityLogForMonth } from '../../activityLogs/types';

export type IWebhookActionDoc = {
  label: string;
  action: string;
  type: string;
};

export type IWebhookAction = {
  label: string;
  action: string;
  type: string;
};

export type IWebhook = {
  _id: string;
  url: string;
  actions: IWebhookAction[];
  status: string;
};

export type IWebhookDoc = {
  url: string;
  actions: IWebhookActionDoc[];
};

export type WebooksQueryResponse = {
  webhooks: IWebhook[];
} & QueryResponse;

export type WebhookDetailQueryResponse = {
  webhookDetail: IWebhook;
} & QueryResponse;

export type AddMutationResponse = {
  webhooksAdd: (params: {
    variables: { _id: string; doc: IWebhookDoc };
  }) => Promise<any>;
};

export type EditMutationResponse = {
  webhooksEdit: (params: {
    variables: { _id: string; doc: IWebhookDoc };
  }) => Promise<any>;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

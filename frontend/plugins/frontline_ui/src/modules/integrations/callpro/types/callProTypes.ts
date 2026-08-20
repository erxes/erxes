export interface ICallProConfig {
  enabled: boolean;
  webhookUrl?: string | null;
}

export interface ICallProIntegrationDetail {
  phoneNumber: string;
  recordUrl?: string | null;
}

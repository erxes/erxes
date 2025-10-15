export interface IFacebookIntegration {
  kind: string;
  accountId: string;
  emailScope?: string;
  erxesApiId: string;
  facebookPageIds?: string[];
  facebookPageTokensMap?: { [key: string]: string };
  email: string;
  expiration?: string;
  healthStatus?: string;
  error?: string;
}

export interface IFacebookIntegrationDocument
  extends IFacebookIntegration,
    Document {
  _id: string;
}

export interface IFacebookPageResponse {
  id: string;
  name: string;
}

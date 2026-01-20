import { Document } from 'mongoose';

export interface IIntegration {
    kind: string;
    accountId: string;
    emailScope?: string;
    erxesApiId: string;
    facebookPageId?: string;
    instagramPageIds?: string[];
    facebookPageTokensMap?: { [key: string]: string };
    email: string;
    expiration?: string;
    healthStatus?: string;
    error?: string;
  }
  
  export interface IInstagramIntegrationDocument extends IIntegration, Document {}
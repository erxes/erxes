import { Document } from 'mongoose';

export type syncMode = 'oneWay' | 'twoWay';

export type IGithubConfig = {
  teamId: string;
  repoName: string;
  installationId: number;
  syncMode: syncMode;
  subdomain: string;
};

export interface IGithubConfigDocument extends IGithubConfig, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

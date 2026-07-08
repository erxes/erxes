import { Document } from 'mongoose';

export type IGithubConnection = {
  installationId: number;
  orgName: string;
  orgAvatarUrl?: string;
  orgType: string;
  initiatedUserId?: string;
  isActive: boolean;
  subdomain: string;
};

export interface IGithubConnectionDocument extends IGithubConnection, Document {
  _id: string;
  updatedAt: Date;
}
